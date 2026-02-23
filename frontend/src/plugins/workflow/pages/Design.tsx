import { useEffect, useRef, useState } from 'react';
import { Card, Button, Input, Form, message, Space } from 'antd';
import { Graph, Shape } from '@antv/x6';
import { Stencil } from '@antv/x6-plugin-stencil';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import request from '@/utils/request';

// Register basic shapes
Graph.registerNode('start-node', {
    inherit: 'circle',
    width: 50,
    height: 50,
    attrs: {
        body: { fill: '#f6ffed', stroke: '#52c41a', strokeWidth: 2 },
        label: { text: '开始', fill: '#333' }
    },
    data: { type: 'start' }
});

Graph.registerNode('approval-node', {
    inherit: 'rect',
    width: 120,
    height: 50,
    attrs: {
        body: { fill: '#e6f7ff', stroke: '#1890ff', strokeWidth: 2, rx: 5, ry: 5 },
        label: { text: '审批节点', fill: '#333' }
    },
    data: { type: 'approval', assignee_id: null }
});

Graph.registerNode('end-node', {
    inherit: 'circle',
    width: 50,
    height: 50,
    attrs: {
        body: { fill: '#fff1f0', stroke: '#f5222d', strokeWidth: 2 },
        label: { text: '结束', fill: '#333' }
    },
    data: { type: 'end' }
});

export default function WorkflowDesign() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stencilRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [form] = Form.useForm();

    const [selectedNode, setSelectedNode] = useState<any>(null);

    useEffect(() => {
        if (!containerRef.current || !stencilRef.current) return;

        const graph = new Graph({
            container: containerRef.current,
            width: 800,
            height: 600,
            grid: { size: 10, visible: true },
            connecting: {
                router: 'manhattan',
                connector: { name: 'rounded', args: { radius: 8 } },
                anchor: 'center',
                connectionPoint: 'boundary',
                snap: { radius: 20 },
                createEdge() { return new Shape.Edge({ attrs: { line: { stroke: '#A2B1C3', strokeWidth: 2 } } }); }
            },
            interacting: { nodeMovable: true, edgeMovable: true },
        });

        graph.use(new Keyboard());
        graph.use(new Selection({ enabled: true, showNodeSelectionBox: true }));
        graph.use(new Snapline({ enabled: true }));

        const stencil = new Stencil({
            title: '组件库',
            target: graph,
            stencilGraphWidth: 200,
            stencilGraphHeight: 300,
            layoutOptions: { columns: 1, columnWidth: 150, rowHeight: 70 },
        });
        stencilRef.current.appendChild(stencil.container);

        const startNode = graph.createNode({ shape: 'start-node' });
        const approvalNode = graph.createNode({ shape: 'approval-node' });
        const endNode = graph.createNode({ shape: 'end-node' });
        stencil.load([startNode, approvalNode, endNode]);

        graph.on('node:click', ({ node }) => {
            setSelectedNode(node);
            form.setFieldsValue({
                name: node.attr('label/text'),
                assignee_id: node.getData()?.assignee_id
            });
        });

        graph.on('blank:click', () => {
            setSelectedNode(null);
        });

        // delete key bind
        graph.bindKey(['backspace', 'delete'], () => {
            const cells = graph.getSelectedCells();
            if (cells.length) graph.removeCells(cells);
        });

        graphRef.current = graph;

        return () => {
            graph.dispose();
        };
    }, []);

    const handleSave = async () => {
        if (!graphRef.current) return;
        const flowData = graphRef.current.toJSON();
        const values = await form.validateFields();

        try {
            const res = await request.post('/plugins/workflow/defs', {
                name: values.flow_name,
                description: values.description,
                flow_data: flowData
            });
            if (res.data.code === 200) {
                message.success('流程创建成功！');
            }
        } catch (e: any) {
            // request will show error message automatically
        }
    };

    const updateNodeData = (_, allValues) => {
        if (!selectedNode) return;
        selectedNode.attr('label/text', allValues.name);
        selectedNode.setData({ ...selectedNode.getData(), assignee_id: allValues.assignee_id ? Number(allValues.assignee_id) : null, name: allValues.name });
    };

    return (
        <div className="flex flex-col gap-4 p-4 h-full">
            <Card className="shadow-sm">
                <Form form={form} layout="inline" className="w-full">
                    <Form.Item name="flow_name" label="流程名称" rules={[{ required: true }]}>
                        <Input placeholder="输入流程图名称" />
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <Input placeholder="流程说明" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={handleSave}>保存流程定义</Button>
                    </Form.Item>
                </Form>
            </Card>

            <div className="flex flex-1 gap-4 overflow-hidden border border-gray-200">
                <div className="w-[200px] h-full border-r border-gray-200 bg-white" ref={stencilRef} />
                <div className="flex-1 h-full bg-slate-50 relative" ref={containerRef} />

                <div className="w-[250px] h-full border-l border-gray-200 bg-white p-4">
                    <h3 className="font-semibold text-gray-700 mb-4">节点属性</h3>
                    {selectedNode ? (
                        <Form form={form} layout="vertical" onValuesChange={updateNodeData}>
                            <Form.Item name="name" label="节点名称">
                                <Input />
                            </Form.Item>
                            {selectedNode.getData()?.type === 'approval' && (
                                <Form.Item name="assignee_id" label="审批人ID (指派给User.ID)">
                                    <Input type="number" placeholder="输入用户的数字ID，例如 1" />
                                </Form.Item>
                            )}
                        </Form>
                    ) : (
                        <div className="text-gray-400 text-sm">请在画布中选中节点</div>
                    )}
                </div>
            </div>
        </div>
    );
}
