import React from 'react';
import { Card, Select, Input, Button, Upload, Tag } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ProcessFormWidget: React.FC = () => {
    return (
        <div className="flex flex-col gap-4 h-full">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 m-0 h-[28px]">
                <div className="w-1.5 h-5 bg-purple-600 rounded-full"></div>
                新建业务流程
            </h3>

            <Card className="rounded-2xl shadow-sm border-none flex-1 overflow-y-auto custom-scrollbar" bodyStyle={{ padding: '24px' }}>
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">普通内部请示审批单</h2>
                        <span className="text-gray-400 text-xs font-mono">编号: OA-REQ-2026-0222-0045</span>
                    </div>
                    <Tag color="blue" className="rounded px-2 tracking-widest bg-blue-50 text-blue-500 border-none font-medium">草稿</Tag>
                </div>

                <div className="flex flex-col gap-5">
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">流程标题 <span className="text-red-500">*</span></div>
                        <Input size="large" placeholder="关于2026年Q1部门团建费用增加申请" className="rounded-xl bg-gray-50 hover:bg-white focus:bg-white border-transparent hover:border-blue-400 focus:border-blue-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">紧急程度</div>
                            <Select size="large" defaultValue="normal" className="w-full rounded-xl" options={[{ value: 'normal', label: '普通' }, { value: 'urgent', label: '紧急' }]} />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">申请类型</div>
                            <Select size="large" defaultValue="admin" className="w-full rounded-xl" options={[{ value: 'admin', label: '行政办公' }, { value: 'finance', label: '财务报销' }]} />
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">申请详情描述 <span className="text-red-500">*</span></div>
                        <TextArea rows={4} placeholder="请输入具体理由和申请内容..." className="rounded-xl bg-gray-50 hover:bg-white focus:bg-white border-transparent hover:border-blue-400 focus:border-blue-400 resize-none p-4" />
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">附件上传(支持PDF, Word, 图片)</div>
                        <Upload.Dragger name="files" action="/upload.do" className="bg-gray-50 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors p-2">
                            <p className="ant-upload-drag-icon">
                                <CloudUploadOutlined className="text-gray-300 text-2xl" />
                            </p>
                            <p className="text-gray-400 text-xs mt-2">点击或拖拽文件到此区域</p>
                        </Upload.Dragger>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <Button size="large" className="rounded-xl text-gray-500 border-gray-200 flex-1 hover:text-gray-700 hover:border-gray-300">重置</Button>
                        <Button size="large" className="rounded-xl text-blue-600 border-blue-200 bg-blue-50 flex-1">保存草稿</Button>
                        <Button size="large" type="primary" className="rounded-xl bg-blue-600 shadow-md shadow-blue-200/50 hover:bg-blue-500 flex-1">提交审批</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProcessFormWidget;
