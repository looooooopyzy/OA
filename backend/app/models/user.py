"""用户、部门、角色、权限、菜单模型及关联表。"""

from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin

# ──────────────────────────── 关联表 ────────────────────────────

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)

role_menus = Table(
    "role_menus",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("menu_id", Integer, ForeignKey("menus.id", ondelete="CASCADE"), primary_key=True),
)


# ──────────────────────────── 部门 ────────────────────────────

class Department(Base, IdMixin, TimestampMixin):
    """部门/组织架构。"""

    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    parent_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    leader_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # 关系
    children: Mapped[list["Department"]] = relationship(
        "Department", back_populates="parent", cascade="all, delete-orphan"
    )
    parent: Mapped[Optional["Department"]] = relationship(
        "Department", back_populates="children", remote_side="Department.id"
    )
    users: Mapped[list["User"]] = relationship(
        "User", back_populates="department", foreign_keys="[User.department_id]"
    )


# ──────────────────────────── 用户 ────────────────────────────

class User(Base, IdMixin, TimestampMixin):
    """系统用户。"""

    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    real_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    department_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True
    )

    # 关系
    department: Mapped[Optional[Department]] = relationship(
        "Department", back_populates="users", foreign_keys="[User.department_id]"
    )
    roles: Mapped[list["Role"]] = relationship(
        "Role", secondary=user_roles, back_populates="users"
    )


# ──────────────────────────── 角色 ────────────────────────────

class Role(Base, IdMixin, TimestampMixin):
    """系统角色。"""

    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    data_scope: Mapped[str] = mapped_column(
        String(20), default="self", comment="数据范围: all/department/self"
    )

    # 关系
    users: Mapped[list[User]] = relationship(
        "User", secondary=user_roles, back_populates="roles"
    )
    permissions: Mapped[list["Permission"]] = relationship(
        "Permission", secondary=role_permissions, back_populates="roles"
    )
    menus: Mapped[list["Menu"]] = relationship(
        "Menu", secondary=role_menus, back_populates="roles"
    )


# ──────────────────────────── 权限 ────────────────────────────

class Permission(Base, IdMixin, TimestampMixin):
    """操作权限（资源 + 动作粒度）。"""

    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    resource: Mapped[str] = mapped_column(String(50), nullable=False, comment="资源标识")
    action: Mapped[str] = mapped_column(String(50), nullable=False, comment="操作标识")

    # 关系
    roles: Mapped[list[Role]] = relationship(
        "Role", secondary=role_permissions, back_populates="permissions"
    )


# ──────────────────────────── 菜单 ────────────────────────────

class Menu(Base, IdMixin, TimestampMixin):
    """系统菜单（支持无限层级）。"""

    __tablename__ = "menus"

    name: Mapped[str] = mapped_column(String(50), nullable=False)
    path: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("menus.id", ondelete="CASCADE"), nullable=True
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    permission_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    plugin_id: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="所属插件名称"
    )
    menu_type: Mapped[str] = mapped_column(
        String(20), default="menu", comment="类型: directory/menu/button"
    )

    # 关系
    children: Mapped[list["Menu"]] = relationship(
        "Menu", back_populates="parent_menu", cascade="all, delete-orphan"
    )
    parent_menu: Mapped[Optional["Menu"]] = relationship(
        "Menu", back_populates="children", remote_side="Menu.id"
    )
    roles: Mapped[list[Role]] = relationship(
        "Role", secondary=role_menus, back_populates="menus"
    )
