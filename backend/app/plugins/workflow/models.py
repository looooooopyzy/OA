from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy import String, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, IdMixin
from app.models.user import User

class WorkflowDef(Base, IdMixin, TimestampMixin):
    """流程定义表"""
    __tablename__ = "workflow_defs"

    name: Mapped[str] = mapped_column(String(100), index=True, comment="流程名称")
    description: Mapped[Optional[str]] = mapped_column(String(255), comment="流程描述")
    version: Mapped[int] = mapped_column(Integer, default=1, comment="版本号")
    is_active: Mapped[bool] = mapped_column(default=True, comment="是否启用")
    
    # 将前端画布上的节点和连线、条件配置全部存入此 JSON
    # 数据结构如 { "nodes": [...], "edges": [...] }
    flow_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, comment="流定义JSON")
    
    # 表单配置参数，如果有的话 (例如表单结构的 JSON Schema)
    form_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True, comment="表单结构JSON")

    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    creator: Mapped["User"] = relationship("User", foreign_keys=[creator_id])


class WorkflowInstance(Base, IdMixin, TimestampMixin):
    """流程实例表 (每次发起产生一条记录)"""
    __tablename__ = "workflow_instances"

    workflow_def_id: Mapped[int] = mapped_column(ForeignKey("workflow_defs.id"))
    workflow_def: Mapped["WorkflowDef"] = relationship("WorkflowDef")

    # 发起人
    initiator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    initiator: Mapped["User"] = relationship("User", foreign_keys=[initiator_id])

    title: Mapped[str] = mapped_column(String(200), comment="实例标题，例如: XXX的请假申请")
    
    # 状态: running, completed, rejected, terminated
    status: Mapped[str] = mapped_column(String(20), default="running", index=True)
    
    # 流程表单携带的业务数据，例如 {"amount": 5000, "days": 3}
    business_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # 引擎当前运行到了哪些节点 (可能并行分支有多个 active_node)
    current_node_ids: Mapped[List[str]] = mapped_column(JSON, default=list, comment="当前正在执行的画布NodeID列表")

    end_time: Mapped[Optional[datetime]] = mapped_column(nullable=True, comment="流程结束时间")

    tasks: Mapped[List["WorkflowTask"]] = relationship("WorkflowTask", back_populates="instance", cascade="all, delete-orphan")


class WorkflowTask(Base, IdMixin, TimestampMixin):
    """流程任务表 (每次流转到审批节点会生成待办任务)"""
    __tablename__ = "workflow_tasks"

    instance_id: Mapped[int] = mapped_column(ForeignKey("workflow_instances.id"))
    instance: Mapped["WorkflowInstance"] = relationship("WorkflowInstance", back_populates="tasks")

    node_id: Mapped[str] = mapped_column(String(50), comment="对应前端图纸上的 Node ID")
    node_name: Mapped[str] = mapped_column(String(100), comment="当前节点名称 (如: 主管审批)")

    # 任务状态: pending(待处理), approved(已同意), rejected(已拒绝), transferred(已转交)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)

    # 处理人 (审批流往往需要指定到具体的 User ID)
    assignee_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    assignee: Mapped["User"] = relationship("User", foreign_keys=[assignee_id])

    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="审批意见")
    
    handled_at: Mapped[Optional[datetime]] = mapped_column(nullable=True, comment="处理时间")
