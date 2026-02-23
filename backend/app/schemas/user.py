"""用户相关 Pydantic Schema。"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """用户基础字段。"""
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    real_name: Optional[str] = None
    avatar: Optional[str] = None
    department_id: Optional[int] = None


class UserCreate(UserBase):
    """创建用户请求。"""
    password: str
    role_ids: list[int] = []


class UserUpdate(BaseModel):
    """更新用户请求（所有字段可选）。"""
    email: Optional[str] = None
    phone: Optional[str] = None
    real_name: Optional[str] = None
    avatar: Optional[str] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None
    role_ids: Optional[list[int]] = None


class UserOut(UserBase):
    """用户响应。"""
    id: int
    is_active: bool
    created_at: datetime
    roles: list["RoleOut"] = []
    department_name: Optional[str] = None

    model_config = {"from_attributes": True}


class UserInfo(BaseModel):
    """当前用户信息（含权限）。"""
    id: int
    username: str
    real_name: Optional[str] = None
    avatar: Optional[str] = None
    roles: list[str] = []
    permissions: list[str] = []
    menus: list[dict] = []


# ──────────────────── 角色 ────────────────────

class RoleBase(BaseModel):
    """角色基础字段。"""
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    data_scope: str = "self"


class RoleCreate(RoleBase):
    """创建角色请求。"""
    department_ids: list[int] = []
    permission_ids: list[int] = []
    menu_ids: list[int] = []


class RoleUpdate(BaseModel):
    """更新角色请求。"""
    name: Optional[str] = None
    description: Optional[str] = None
    data_scope: Optional[str] = None
    department_ids: Optional[list[int]] = None
    permission_ids: Optional[list[int]] = None
    menu_ids: Optional[list[int]] = None


class RoleOut(BaseModel):
    """角色响应。"""
    id: int
    name: str
    code: str
    description: Optional[str] = None
    data_scope: str
    departments: list[dict] = []
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────── 部门 ────────────────────

class DepartmentBase(BaseModel):
    """部门基础字段。"""
    name: str
    parent_id: Optional[int] = None
    sort_order: int = 0
    leader_id: Optional[int] = None


class DepartmentCreate(DepartmentBase):
    """创建部门请求。"""
    pass


class DepartmentUpdate(BaseModel):
    """更新部门请求。"""
    name: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    leader_id: Optional[int] = None


class DepartmentOut(DepartmentBase):
    """部门响应。"""
    id: int
    created_at: datetime
    children: list["DepartmentOut"] = []

    model_config = {"from_attributes": True}


# ──────────────────── 权限 ────────────────────

class PermissionOut(BaseModel):
    """权限响应。"""
    id: int
    name: str
    code: str
    resource: str
    action: str

    model_config = {"from_attributes": True}


# ──────────────────── 菜单 ────────────────────

class MenuBase(BaseModel):
    """菜单基础字段。"""
    name: str
    path: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int = 0
    is_visible: bool = True
    permission_code: Optional[str] = None
    plugin_id: Optional[str] = None
    menu_type: str = "menu"


class MenuCreate(MenuBase):
    """创建菜单请求。"""
    pass


class MenuUpdate(BaseModel):
    """更新菜单请求。"""
    name: Optional[str] = None
    path: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_visible: Optional[bool] = None
    permission_code: Optional[str] = None
    menu_type: Optional[str] = None


class MenuOut(MenuBase):
    """菜单响应。"""
    id: int
    children: list["MenuOut"] = []

    model_config = {"from_attributes": True}


# ──────────────────── 插件 ────────────────────

class PluginOut(BaseModel):
    """插件响应。"""
    name: str
    version: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    enabled: bool = True
    menus: list[dict] = []

    model_config = {"from_attributes": True}
