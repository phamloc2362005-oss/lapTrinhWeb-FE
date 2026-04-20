import { Button, Col, Form, Input, Modal, Row, Select, Table, Tabs, message, notification } from "antd";
import { MonitorOutlined } from "@ant-design/icons";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { IResume, ISubscribers } from "@/types/backend";
import { useAppSelector } from "@/redux/hooks";
import {
    callChangePassword,
    callCreateSubscriber,
    callFetchAllSkill,
    callFetchResumeByUser,
    callGetSubscriberSkills,
    callUpdateSubscriber
} from "@/config/api";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const getErrorMessage = (res: any) => {
    if (res?.message && Array.isArray(res.message)) return res.message[0];
    return res?.message || res?.error || 'Có lỗi xảy ra';
};

const UserResume = () => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data.result as IResume[])
            }
            setIsFetching(false);
        }
        init();
    }, [])

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (_, __, index) => <>{index + 1}</>
        },
        {
            title: 'Công ty',
            dataIndex: "companyName",
        },
        {
            title: 'Vị trí',
            dataIndex: ["job", "name"],
        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(_, record) {
                return <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
            },
        },
        {
            title: '',
            dataIndex: "",
            render(_, record) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Chi tiết
                    </a>
                )
            },
        },
    ];

    return (
        <Table<IResume>
            rowKey={(record) => record.id ?? record.url}
            columns={columns}
            dataSource={listCV}
            loading={isFetching}
            pagination={false}
        />
    )
}

const UserUpdateInfo = () => {
    return <div>Chức năng cập nhật thông tin sẽ được bổ sung sau.</div>;
}

const JobByEmail = () => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string; }[]>([]);
    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const arr = res.data.skills.map((item: any) => ({
                    label: item.name as string,
                    value: item.id + "" as string
                }));
                form.setFieldValue("skills", arr);
            }
        }
        init();
    }, [form])

    const fetchSkill = async () => {
        const query = `page=1&size=100&sort=createdAt,desc`;
        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => ({
                label: item.name as string,
                value: item.id + "" as string
            })) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const arr = values.skills?.map((item: any) => item?.id ? { id: item.id } : { id: item });

        if (!subscriber?.id) {
            const res = await callCreateSubscriber({
                email: user.email,
                name: user.name,
                skills: arr
            });
            setIsSubmitting(false);

            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: getErrorMessage(res)
                });
            }
            return;
        }

        const res = await callUpdateSubscriber({
            id: subscriber?.id,
            skills: arr
        });
        setIsSubmitting(false);

        if (res.data) {
            message.success("Cập nhật thông tin thành công");
            setSubscriber(res.data);
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: getErrorMessage(res)
            });
        }
    }

    return (
        <Form onFinish={onFinish} form={form}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Form.Item
                        label="Kỹ năng"
                        name="skills"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 kỹ năng' }]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={<><MonitorOutlined /> Tìm theo kỹ năng...</>}
                            optionLabelProp="label"
                            options={optionsSkills}
                        />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" onClick={() => form.submit()} loading={isSubmitting}>
                        Cập nhật
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

const ChangePasswordTab = () => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinish = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        setIsSubmitting(true);
        const res = await callChangePassword(values.currentPassword, values.newPassword);
        setIsSubmitting(false);

        if (res?.statusCode === 200) {
            message.success("Đổi mật khẩu thành công");
            form.resetFields();
            return;
        }

        notification.error({
            message: "Không thể đổi mật khẩu",
            description: getErrorMessage(res)
        });
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 480 }}>
            <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
                <Input.Password placeholder="Nhập mật khẩu cũ" autoComplete="current-password" />
            </Form.Item>
            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới" },
                    { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                ]}
            >
                <Input.Password placeholder="Nhập mật khẩu mới" autoComplete="new-password" />
            </Form.Item>
            <Form.Item
                label="Nhập lại mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                    { required: true, message: "Vui lòng nhập lại mật khẩu mới" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                    Cập nhật mật khẩu
                </Button>
            </Form.Item>
        </Form>
    );
};

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `Rải CV`,
            children: <UserResume />,
        },
        {
            key: 'email-by-skills',
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <ChangePasswordTab />,
        },
    ];

    return (
        <Modal
            title="Quản lý tài khoản"
            open={open}
            onCancel={() => onClose(false)}
            maskClosable={false}
            footer={null}
            destroyOnClose={true}
            width={isMobile ? "100%" : "1000px"}
        >
            <div style={{ minHeight: 400 }}>
                <Tabs defaultActiveKey="user-resume" items={items} />
            </div>
        </Modal>
    )
}

export default ManageAccount;
