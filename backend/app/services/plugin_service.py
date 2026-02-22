"""插件服务 — 插件状态管理。"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.plugin_engine import plugin_engine
from app.models.plugin import PluginRecord


class PluginService:
    """插件管理业务逻辑。"""

    @staticmethod
    async def get_list(db: AsyncSession) -> list[dict]:
        """获取所有插件列表（合并文件系统发现 + 数据库状态）。"""
        manifests = plugin_engine.manifests

        # 从数据库获取已注册插件状态
        result = await db.execute(select(PluginRecord))
        records = {r.name: r for r in result.scalars().all()}

        plugins = []
        for name, manifest in manifests.items():
            record = records.get(name)
            plugins.append({
                "name": manifest.name,
                "version": manifest.version,
                "display_name": manifest.display_name,
                "description": manifest.description,
                "icon": manifest.icon,
                "enabled": record.enabled if record else True,
                "menus": manifest.menus,
            })

        return plugins

    @staticmethod
    async def toggle(db: AsyncSession, plugin_name: str) -> dict:
        """切换插件启用/禁用状态。"""
        manifest = plugin_engine.get_manifest(plugin_name)
        if not manifest:
            raise NotFoundException(f"插件 {plugin_name} 不存在")

        result = await db.execute(
            select(PluginRecord).where(PluginRecord.name == plugin_name)
        )
        record = result.scalar_one_or_none()

        if record:
            record.enabled = not record.enabled
        else:
            record = PluginRecord(
                name=manifest.name,
                version=manifest.version,
                display_name=manifest.display_name,
                description=manifest.description,
                icon=manifest.icon,
                enabled=False,
            )
            db.add(record)

        await db.flush()
        return {"name": record.name, "enabled": record.enabled}

    @staticmethod
    async def sync_plugins(db: AsyncSession) -> None:
        """将文件系统发现的插件同步到数据库（首次启动时调用）。"""
        manifests = plugin_engine.manifests

        for name, manifest in manifests.items():
            result = await db.execute(
                select(PluginRecord).where(PluginRecord.name == name)
            )
            if not result.scalar_one_or_none():
                record = PluginRecord(
                    name=manifest.name,
                    version=manifest.version,
                    display_name=manifest.display_name,
                    description=manifest.description,
                    icon=manifest.icon,
                    enabled=True,
                )
                db.add(record)

        await db.commit()
