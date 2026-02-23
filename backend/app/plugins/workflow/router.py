from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.response import success, page_response
from app.models.user import User

from .models import WorkflowDef, WorkflowInstance, WorkflowTask
from .schemas import (
    WorkflowDefCreate, WorkflowDefResponse, WorkflowDefUpdate,
    WorkflowInstanceCreate, WorkflowInstanceResponse,
    WorkflowTaskProcess, WorkflowTaskResponse
)
from .engine import WorkflowEngine

router = APIRouter()

# ========================
# 流程定义 API
# ========================
@router.post("/defs")
async def create_def(body: WorkflowDefCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """创建流程定义"""
    wf_def = WorkflowDef(
        name=body.name,
        description=body.description,
        flow_data=body.flow_data,
        form_data=body.form_data,
        creator_id=current_user.id
    )
    db.add(wf_def)
    await db.commit()
    await db.refresh(wf_def)
    return success(data=WorkflowDefResponse.model_validate(wf_def).model_dump())

@router.get("/defs")
async def list_defs(page: int = 1, page_size: int = 10, db: AsyncSession = Depends(get_db)):
    """获取流程定义列表"""
    skip = (page - 1) * page_size
    stmt = select(WorkflowDef).order_by(desc(WorkflowDef.created_at)).offset(skip).limit(page_size)
    items = (await db.execute(stmt)).scalars().all()
    total = await db.scalar(select(func.count()).select_from(WorkflowDef))
    return page_response([WorkflowDefResponse.model_validate(x).model_dump() for x in items], total, page, page_size)

# ========================
# 流程实例 API
# ========================
@router.post("/instances")
async def start_instance(body: WorkflowInstanceCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """发起流程实例"""
    instance = await WorkflowEngine.start_instance(
        db=db,
        def_id=body.workflow_def_id,
        initiator_id=current_user.id,
        title=body.title,
        business_data=body.business_data
    )
    await db.commit()
    await db.refresh(instance)
    return success(data=WorkflowInstanceResponse.model_validate(instance).model_dump())

@router.get("/instances/my")
async def list_my_instances(page: int = 1, page_size: int = 10, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """获取我发起的实例列表"""
    skip = (page - 1) * page_size
    stmt = select(WorkflowInstance).where(WorkflowInstance.initiator_id == current_user.id).order_by(desc(WorkflowInstance.created_at)).offset(skip).limit(page_size)
    items = (await db.execute(stmt)).scalars().all()
    count_stmt = select(func.count()).select_from(WorkflowInstance).where(WorkflowInstance.initiator_id == current_user.id)
    total = await db.scalar(count_stmt)
    return page_response([WorkflowInstanceResponse.model_validate(x).model_dump() for x in items], total, page, page_size)

# ========================
# 流程任务 API
# ========================
@router.get("/tasks/todo")
async def list_my_todos(page: int = 1, page_size: int = 10, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """获取我的待办任务"""
    skip = (page - 1) * page_size
    stmt = select(WorkflowTask).where(WorkflowTask.assignee_id == current_user.id, WorkflowTask.status == "pending").order_by(desc(WorkflowTask.created_at)).offset(skip).limit(page_size)
    items = (await db.execute(stmt)).scalars().all()
    count_stmt = select(func.count()).select_from(WorkflowTask).where(WorkflowTask.assignee_id == current_user.id, WorkflowTask.status == "pending")
    total = await db.scalar(count_stmt)
    return page_response([WorkflowTaskResponse.model_validate(x).model_dump() for x in items], total, page, page_size)

@router.post("/tasks/{task_id}/process")
async def process_task(task_id: int, body: WorkflowTaskProcess, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """处理审批任务"""
    await WorkflowEngine.process_task(
        db=db,
        task_id=task_id,
        user_id=current_user.id,
        action=body.action,
        comment=body.comment,
        transfer_user_id=body.transfer_user_id
    )
    await db.commit()
    return success(message="处理成功")
