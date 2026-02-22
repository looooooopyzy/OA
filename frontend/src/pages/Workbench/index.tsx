import React from 'react';
import { Card, Select, Input, Button, Upload, Tag, Badge } from 'antd';
import {
    CloudUploadOutlined,
    BulbOutlined
} from '@ant-design/icons';
import { FileText, List, Users, Wallet, Trophy } from 'lucide-react';

const { TextArea } = Input;

const Workbench: React.FC = () => {
    return (
        <div className="grid grid-cols-12 gap-6">

            {/* Column 1: Key Metrics */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 m-0 mt-1">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                    关键指标视图
                </h3>

                <Card className="rounded-2xl shadow-sm border-none hover:shadow-md transition-shadow relative overflow-hidden" bodyStyle={{ padding: '20px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                            <List size={24} />
                        </div>
                        <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-0.5 rounded-full">+12% &uarr;</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">今日待审任务</div>
                    <div className="text-3xl font-bold text-gray-800">24</div>
                </Card>

                <Card className="rounded-2xl shadow-sm border-none hover:shadow-md transition-shadow" bodyStyle={{ padding: '20px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                            <Users size={24} />
                        </div>
                        <span className="text-gray-400 text-xs mt-1">稳定</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">部门出勤率</div>
                    <div className="text-3xl font-bold text-gray-800">98.2%</div>
                </Card>

                <Card className="rounded-2xl shadow-sm border-none hover:shadow-md transition-shadow" bodyStyle={{ padding: '20px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                            <Wallet size={24} />
                        </div>
                        <span className="text-red-500 text-sm font-medium bg-red-50 px-2 py-0.5 rounded-full">-5.2% &darr;</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">本月预算消耗</div>
                    <div className="text-3xl font-bold text-gray-800">&yen; 14,200</div>
                </Card>

                <Card className="rounded-2xl shadow-sm border-none hover:shadow-md transition-shadow" bodyStyle={{ padding: '20px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                            <Trophy size={24} />
                        </div>
                        <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-0.5 rounded-full">+3</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">本周荣誉成就</div>
                    <div className="text-3xl font-bold text-gray-800">8</div>
                </Card>
            </div>

            {/* Column 2: New Process Form */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 m-0 mt-1">
                    <div className="w-1.5 h-5 bg-purple-600 rounded-full"></div>
                    新建业务流程
                </h3>

                <Card className="rounded-2xl shadow-sm border-none h-full" bodyStyle={{ padding: '32px' }}>
                    <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">普通内部请示审批单</h2>
                            <span className="text-gray-400 text-sm font-mono">编号: OA-REQ-2026-0222-0045</span>
                        </div>
                        <Tag color="blue" className="rounded px-2 tracking-widest bg-blue-50 text-blue-500 border-none font-medium">草稿</Tag>
                    </div>

                    <div className="flex flex-col gap-6">
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
                            <TextArea rows={6} placeholder="请输入具体理由和申请内容..." className="rounded-xl bg-gray-50 hover:bg-white focus:bg-white border-transparent hover:border-blue-400 focus:border-blue-400 resize-none p-4" />
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">附件上传(支持PDF, Word, 图片)</div>
                            <Upload.Dragger name="files" action="/upload.do" className="bg-gray-50 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                                <p className="ant-upload-drag-icon">
                                    <CloudUploadOutlined className="text-gray-300" />
                                </p>
                                <p className="text-gray-400 text-sm">点击或拖拽文件到此区域</p>
                            </Upload.Dragger>
                        </div>

                        <div className="flex gap-4 mt-4">
                            <Button size="large" className="rounded-xl text-gray-500 border-gray-200 flex-1 hover:text-gray-700 hover:border-gray-300">重置表单</Button>
                            <Button size="large" className="rounded-xl text-blue-600 border-blue-200 bg-blue-50 flex-1">保存草稿</Button>
                            <Button size="large" type="primary" className="rounded-xl bg-blue-600 shadow-md shadow-blue-200/50 hover:bg-blue-500 flex-1">提交审批</Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Column 3: Recent Approvals & Suggestions */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="flex justify-between items-center mt-1">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 m-0">
                        <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
                        最近审批流水
                    </h3>
                    <a href="#" className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-500 transition-colors">查看全部 &rsaquo;</a>
                </div>

                <Card className="rounded-2xl shadow-sm border-none flex-1" bodyStyle={{ padding: '0px' }}>
                    <div className="grid grid-cols-12 text-xs text-gray-400 font-medium px-6 py-4 border-b border-gray-50">
                        <div className="col-span-7">申请项目 / 发起人</div>
                        <div className="col-span-3 text-center">状态</div>
                        <div className="col-span-2 text-right">时间</div>
                    </div>

                    <div className="flex flex-col">
                        {[
                            { title: '年假申请', user: '王志远 · 研发部', status: '审批中', statusColor: 'warning', iconBg: 'bg-red-50', iconColor: 'text-red-400', time: '10:24 AM' },
                            { title: '采购电脑配件', user: '李雪 · 综合办', status: '已通过', statusColor: 'success', iconBg: 'bg-blue-50', iconColor: 'text-blue-400', time: '昨天' },
                            { title: '差旅费报销', user: '周星 · 销售部', status: '被驳回', statusColor: 'error', iconBg: 'bg-purple-50', iconColor: 'text-purple-400', time: '2月21日' },
                            { title: '加班核定申请', user: '张海 · 研发中心', status: '待我审', statusColor: 'processing', iconBg: 'bg-gray-100', iconColor: 'text-gray-500', time: '2月20日' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex grid grid-cols-12 items-center px-6 py-5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <div className="col-span-7 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center ${item.iconBg} ${item.iconColor} group-hover:scale-110 transition-transform`}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
                                        <div className="text-xs text-gray-400">{item.user}</div>
                                    </div>
                                </div>
                                <div className="col-span-3 flex justify-center">
                                    <Badge status={item.statusColor as any} text={<span className={`text-xs ${item.statusColor === 'warning' ? 'text-amber-500' : item.statusColor === 'success' ? 'text-green-500' : item.statusColor === 'error' ? 'text-red-500' : 'text-blue-500'} font-medium`}>{item.status}</span>} />
                                </div>
                                <div className="col-span-2 text-right text-xs text-gray-400 font-medium">{item.time}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Suggestion Card */}
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl p-5 border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-400/20 transition-all"></div>
                    <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3 text-sm">
                        <BulbOutlined className="text-blue-500 text-lg" />
                        智能建议
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium m-0 relative z-10">
                        系统检测到你有 4 个待处理的财务报销单已积压超过 48 小时，建议优先处理以保证部门预算流转。
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Workbench;
