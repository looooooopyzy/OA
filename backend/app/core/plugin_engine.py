"""微内核插件引擎 — 自动发现、注册和加载插件。

插件目录结构::

    plugins/
    └── my-plugin/
        ├── manifest.json   # 插件元数据（必须）
        └── router.py       # FastAPI APIRouter（必须）

插件引擎会在应用启动时扫描 ``plugins/`` 目录，读取 manifest，
动态导入 ``router.py`` 并将其路由挂载到 ``/api/v1/plugins/{name}/``。
"""

import importlib
import json
import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI

logger = logging.getLogger(__name__)

PLUGINS_DIR = Path(__file__).resolve().parent.parent / "plugins"


class PluginManifest:
    """插件清单数据。"""

    def __init__(self, data: dict[str, Any], plugin_dir: Path):
        self.name: str = data["name"]
        self.version: str = data.get("version", "1.0.0")
        self.display_name: str = data.get("displayName", self.name)
        self.description: str = data.get("description", "")
        self.icon: str = data.get("icon", "AppstoreOutlined")
        self.author: str = data.get("author", "")
        self.dependencies: list[str] = data.get("dependencies", [])
        self.menus: list[dict] = data.get("menus", [])
        self.permissions: list[str] = data.get("permissions", [])
        self.plugin_dir = plugin_dir

    def to_dict(self) -> dict:
        """序列化为字典。"""
        return {
            "name": self.name,
            "version": self.version,
            "displayName": self.display_name,
            "description": self.description,
            "icon": self.icon,
            "author": self.author,
            "menus": self.menus,
            "permissions": self.permissions,
        }


class PluginEngine:
    """微内核插件引擎。

    负责插件的发现、验证、加载和路由挂载。

    使用示例::

        engine = PluginEngine()
        engine.discover()
        engine.load_all(app)
    """

    def __init__(self):
        self._manifests: dict[str, PluginManifest] = {}
        self._loaded: set[str] = set()

    @property
    def manifests(self) -> dict[str, PluginManifest]:
        """获取所有已发现的插件清单。"""
        return self._manifests

    @property
    def loaded_plugins(self) -> set[str]:
        """获取所有已加载的插件名。"""
        return self._loaded

    def discover(self) -> list[PluginManifest]:
        """扫描 plugins 目录，发现所有有效插件。

        有效插件需同时包含 manifest.json 和 router.py。
        跳过以 _ 开头的目录（如 _template）。
        """
        self._manifests.clear()

        if not PLUGINS_DIR.exists():
            logger.warning("插件目录不存在: %s", PLUGINS_DIR)
            return []

        for plugin_dir in sorted(PLUGINS_DIR.iterdir()):
            if not plugin_dir.is_dir():
                continue
            if plugin_dir.name.startswith("_"):
                continue

            manifest_path = plugin_dir / "manifest.json"
            router_path = plugin_dir / "router.py"

            if not manifest_path.exists():
                logger.warning("插件 %s 缺少 manifest.json，跳过", plugin_dir.name)
                continue
            if not router_path.exists():
                logger.warning("插件 %s 缺少 router.py，跳过", plugin_dir.name)
                continue

            try:
                with open(manifest_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                manifest = PluginManifest(data, plugin_dir)
                self._manifests[manifest.name] = manifest
                logger.info("发现插件: %s v%s", manifest.display_name, manifest.version)
            except Exception as e:
                logger.error("解析插件 %s 的 manifest 失败: %s", plugin_dir.name, e)

        return list(self._manifests.values())

    def load_all(self, app: FastAPI) -> None:
        """加载所有已发现的插件，将路由挂载到 FastAPI 应用。"""
        for name, manifest in self._manifests.items():
            self._load_plugin(app, manifest)

    def _load_plugin(self, app: FastAPI, manifest: PluginManifest) -> None:
        """加载单个插件。"""
        if manifest.name in self._loaded:
            return

        try:
            module_path = f"app.plugins.{manifest.name}.router"
            module = importlib.import_module(module_path)
            router = getattr(module, "router", None)

            if router is None:
                logger.error(
                    "插件 %s 的 router.py 中未找到 'router' 对象", manifest.name
                )
                return

            prefix = f"/api/v1/plugins/{manifest.name}"
            app.include_router(router, prefix=prefix, tags=[manifest.display_name])
            self._loaded.add(manifest.name)
            logger.info(
                "已加载插件: %s → %s", manifest.display_name, prefix
            )
        except Exception as e:
            logger.error("加载插件 %s 失败: %s", manifest.name, e)

    def get_manifest(self, name: str) -> PluginManifest | None:
        """根据名称获取插件清单。"""
        return self._manifests.get(name)

    def get_all_menus(self) -> list[dict]:
        """获取所有插件注册的菜单项。"""
        menus = []
        for manifest in self._manifests.values():
            for menu in manifest.menus:
                menus.append({**menu, "plugin": manifest.name})
        return menus


# 全局插件引擎单例
plugin_engine = PluginEngine()
