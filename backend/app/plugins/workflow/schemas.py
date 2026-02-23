from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field

# =========
# DTO Base
# =========
class PaginationSchema(BaseModel):
    page: int = 1
    page_size: int = 10

# ========================
# 流程定义 (WorkflowDef)
# ========================
class WorkflowDefCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    flow_data: Dict[str, Any] = Field(default_factory=dict)
    form_data: Optional[Dict[str, Any]] = None

class WorkflowDefUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    flow_data: Optional[Dict[str, Any]] = None
    form_data: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class WorkflowDefResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    version: int
    is_active: bool
    flow_data: Dict[str, Any]
    form_data: Optional[Dict[str, Any]]
    creator_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# ============================
# 流程实例 (WorkflowInstance)
# ============================
class WorkflowInstanceCreate(BaseModel):
    workflow_def_id: int
    title: str = Field(..., max_length=200)
    business_data: Dict[str, Any] = Field(default_factory=dict)

class WorkflowInstanceResponse(BaseModel):
    id: int
    workflow_def_id: int
    initiator_id: int
    title: str
    status: str
    current_node_ids: List[str]
    business_data: Dict[str, Any]
    created_at: datetime
    end_time: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)

# ============================
# 流程任务 (WorkflowTask)
# ============================
class WorkflowTaskProcess(BaseModel):
    action: str = Field(..., description="agree, reject, transfer")
    comment: Optional[str] = None
    transfer_user_id: Optional[int] = None

class WorkflowTaskResponse(BaseModel):
    id: int
    instance_id: int
    node_id: str
    node_name: str
    status: str
    assignee_id: int
    comment: Optional[str]
    created_at: datetime
    handled_at: Optional[datetime]
    
    # Optional nested data for easier frontend rendering
    title: Optional[str] = None       # Derived from instance
    initiator_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
