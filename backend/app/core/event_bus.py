"""进程内事件总线（发布/订阅模式）。

插件可以通过事件总线进行解耦通信。
"""

import asyncio
from collections import defaultdict
from typing import Any, Callable, Coroutine

# 事件处理器类型：接收事件名称和数据
EventHandler = Callable[[str, Any], Coroutine[Any, Any, None]]


class EventBus:
    """简单的进程内异步事件总线。

    使用示例::

        bus = EventBus()

        async def on_user_created(event: str, data: dict):
            print(f"新用户: {data['username']}")

        bus.subscribe("user.created", on_user_created)
        await bus.publish("user.created", {"username": "张三"})
    """

    def __init__(self):
        self._handlers: dict[str, list[EventHandler]] = defaultdict(list)

    def subscribe(self, event: str, handler: EventHandler) -> None:
        """订阅事件。"""
        self._handlers[event].append(handler)

    def unsubscribe(self, event: str, handler: EventHandler) -> None:
        """取消订阅。"""
        if event in self._handlers:
            self._handlers[event] = [
                h for h in self._handlers[event] if h != handler
            ]

    async def publish(self, event: str, data: Any = None) -> None:
        """发布事件，并发执行所有处理器。"""
        handlers = self._handlers.get(event, [])
        if handlers:
            await asyncio.gather(
                *(handler(event, data) for handler in handlers),
                return_exceptions=True,
            )

    def clear(self) -> None:
        """清除所有事件订阅。"""
        self._handlers.clear()


# 全局事件总线单例
event_bus = EventBus()
