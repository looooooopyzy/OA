import logging
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.exceptions import AppException
from app.models.user import User, Role
from .models import WorkflowDef, WorkflowInstance, WorkflowTask

logger = logging.getLogger(__name__)

class WorkflowEngine:
    """轻量级流程执行引擎"""

    @classmethod
    async def start_instance(cls, db: AsyncSession, def_id: int, initiator_id: int, title: str, business_data: Dict[str, Any]) -> WorkflowInstance:
        """发起一个流程实例"""
        # 获取定义
        res = await db.execute(select(WorkflowDef).where(WorkflowDef.id == def_id, WorkflowDef.is_active == True))
        wf_def = res.scalar_one_or_none()
        if not wf_def:
            raise AppException(404, "流程定义不存在或未启用")

        flow_data = wf_def.flow_data
        nodes = flow_data.get("nodes", [])
        
        # 寻找开始节点
        start_nodes = [n for n in nodes if n.get("shape") == "start" or n.get("data", {}).get("type") == "start"]
        if not start_nodes:
            raise AppException(400, "流程定义中不包含起始节点")
            
        start_node = start_nodes[0]
        
        # 创建实例
        instance = WorkflowInstance(
            workflow_def_id=def_id,
            initiator_id=initiator_id,
            title=title,
            status="running",
            business_data=business_data,
            current_node_ids=[start_node["id"]]
        )
        db.add(instance)
        await db.flush()
        
        # 尝试推进流程到第一个可审批节点
        await cls._advance_from_nodes(db, instance, [start_node], flow_data)
        return instance

    @classmethod
    async def process_task(cls, db: AsyncSession, task_id: int, user_id: int, action: str, comment: Optional[str] = None, transfer_user_id: Optional[int] = None):
        """处理任务"""
        res = await db.execute(select(WorkflowTask).where(WorkflowTask.id == task_id))
        task = res.scalar_one_or_none()
        if not task:
            raise AppException(404, "任务不存在")
            
        if task.status != "pending":
            raise AppException(400, "该任务已处理")
            
        if task.assignee_id != user_id:
            raise AppException(403, "您无权处理该任务")

        # 当前只支持 "agree" (同意), "reject" (拒绝), "transfer" (转交)
        if action == "transfer":
            if not transfer_user_id:
                raise AppException(400, "需要指定转交人")
            task.status = "transferred"
            task.comment = comment
            task.handled_at = datetime.utcnow()
            
            # 生成新任务
            new_task = WorkflowTask(
                instance_id=task.instance_id,
                node_id=task.node_id,
                node_name=task.node_name,
                status="pending",
                assignee_id=transfer_user_id,
                comment=f"转交自用户 {user_id}"
            )
            db.add(new_task)
            await db.flush()
            return
            
        elif action == "reject":
            task.status = "rejected"
            task.comment = comment
            task.handled_at = datetime.utcnow()
            
            # 拒绝后实例直接终结
            res_inst = await db.execute(select(WorkflowInstance).where(WorkflowInstance.id == task.instance_id))
            instance = res_inst.scalar_one()
            instance.status = "rejected"
            instance.end_time = datetime.utcnow()
            await db.flush()
            return

        elif action == "agree":
            task.status = "approved"
            task.comment = comment
            task.handled_at = datetime.utcnow()
            
            # 检查当前节点是否所有任务都已同意（暂时做简单的：只要通过就流转下一节点，后续可加“会签”逻辑）
            res_inst = await db.execute(select(WorkflowInstance).where(WorkflowInstance.id == task.instance_id))
            instance = res_inst.scalar_one()
            
            # 加载定义
            res_def = await db.execute(select(WorkflowDef).where(WorkflowDef.id == instance.workflow_def_id))
            wf_def = res_def.scalar_one()
            
            # 将当前节点视为完成，推进寻找下一个节点
            completed_node_id = task.node_id
            
            # 从 inst 的 current中移除
            curr_nodes = list(instance.current_node_ids)
            if completed_node_id in curr_nodes:
                curr_nodes.remove(completed_node_id)
            instance.current_node_ids = curr_nodes
            
            nodes = wf_def.flow_data.get("nodes", [])
            curr_node_data = next((n for n in nodes if n["id"] == completed_node_id), None)
            
            if curr_node_data:
                await cls._advance_from_nodes(db, instance, [curr_node_data], wf_def.flow_data)

    @classmethod
    async def _advance_from_nodes(cls, db: AsyncSession, instance: WorkflowInstance, source_nodes: List[Dict], flow_data: Dict[str, Any]):
        """从给定的节点开始寻路向下推进。遇到审批节点就停留产生任务，遇到结束节点就终结。"""
        edges = flow_data.get("edges", [])
        nodes = flow_data.get("nodes", [])
        node_dict = {n["id"]: n for n in nodes}
        
        current_node_ids = list(instance.current_node_ids)
        
        for s_node in source_nodes:
            s_id = s_node["id"]
            # 找到基于此节点的后续出边
            out_edges = []
            for e in edges:
                src = e.get("source")
                src_id = src.get("cell") if isinstance(src, dict) else src
                if src_id == s_id:
                    out_edges.append(e)
            
            if not out_edges:
                continue

            for edge in out_edges:
                # 简单解析逻辑，目前暂不处理 "condition" 的 ast 执行
                tgt = edge.get("target")
                target_id = tgt.get("cell") if isinstance(tgt, dict) else tgt
                if not target_id:
                    continue
                    
                t_node = node_dict.get(target_id)
                if not t_node:
                    continue
                
                t_type = t_node.get("data", {}).get("type") or t_node.get("shape")
                
                if t_type == "end":
                    instance.status = "completed"
                    instance.end_time = datetime.utcnow()
                    # 清空当前执行节点
                    current_node_ids = []
                    logger.info("流程实例 %s 抵达结束节点，正常完成。", instance.id)
                elif t_type == "approval":
                    # 产生审批任务并停留
                    if target_id not in current_node_ids:
                        current_node_ids.append(target_id)
                        
                    # 分析审批人
                    assignee_id = t_node.get("data", {}).get("assignee_id")
                    if not assignee_id:
                        logger.warning("节点 %s 未分配审批人，流程可能卡住", target_id)
                        continue
                        
                    task = WorkflowTask(
                        instance_id=instance.id,
                        node_id=target_id,
                        node_name=t_node.get("data", {}).get("name", "未命名审批环节"),
                        status="pending",
                        assignee_id=assignee_id
                    )
                    db.add(task)
                    logger.info("为节点 %s 产生了一个审批流任务分派给用户 %s", target_id, assignee_id)
                else:
                    # 对于未知或是直接路由的节点 (例如逻辑网关)，直接继续递归推进
                    await cls._advance_from_nodes(db, instance, [t_node], flow_data)

        instance.current_node_ids = current_node_ids
        await db.flush()
