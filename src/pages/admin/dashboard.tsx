import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Col, Empty, List, Row, Space, Statistic, Tag, Typography, message } from "antd";
import {
    ApartmentOutlined,
    FileSearchOutlined,
    ReloadOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import styles from "@/styles/admin.module.scss";
import { callFetchAdminJob, callFetchCompany, callFetchResume, callFetchUser } from "@/config/api";

type TDashboardTotals = {
    users: number;
    companies: number;
    jobs: number;
    resumes: number;
};

type TRecentJob = {
    id?: string;
    name?: string;
    companyName?: string;
    createdAt?: string;
};

type TRecentResume = {
    id?: string;
    email?: string;
    status?: string;
    createdAt?: string;
};

const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totals, setTotals] = useState<TDashboardTotals>({
        users: 0,
        companies: 0,
        jobs: 0,
        resumes: 0,
    });
    const [recentJobs, setRecentJobs] = useState<TRecentJob[]>([]);
    const [recentResumes, setRecentResumes] = useState<TRecentResume[]>([]);

    const formatter = (value: number | string) => {
        return <CountUp end={Number(value)} separator="," />;
    };

    const formatDate = (value?: string) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const statusColor = (status?: string) => {
        switch ((status || "").toUpperCase()) {
            case "PENDING":
                return "gold";
            case "REVIEWING":
                return "processing";
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "error";
            default:
                return "default";
        }
    };

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, companiesRes, jobsRes, resumesRes] = await Promise.all([
                callFetchUser("page=1&size=1&sort=createdAt,desc"),
                callFetchCompany("page=1&size=1&sort=createdAt,desc"),
                callFetchAdminJob("page=1&size=5&sort=createdAt,desc"),
                callFetchResume("page=1&size=5&sort=createdAt,desc"),
            ]);

            const usersTotal = Number(usersRes?.data?.meta?.total ?? 0);
            const companiesTotal = Number(companiesRes?.data?.meta?.total ?? 0);
            const jobsTotal = Number(jobsRes?.data?.meta?.total ?? 0);
            const resumesTotal = Number(resumesRes?.data?.meta?.total ?? 0);

            setTotals({
                users: usersTotal,
                companies: companiesTotal,
                jobs: jobsTotal,
                resumes: resumesTotal,
            });

            const jobs = (jobsRes?.data?.result ?? []).map((item: any) => ({
                id: item?.id,
                name: item?.name,
                companyName: item?.company?.name,
                createdAt: item?.createdAt,
            }));
            setRecentJobs(jobs);

            const resumes = (resumesRes?.data?.result ?? []).map((item: any) => ({
                id: item?.id,
                email: item?.email,
                status: item?.status,
                createdAt: item?.createdAt,
            }));
            setRecentResumes(resumes);
        } catch (error) {
            message.error("Không thể tải dữ liệu dashboard.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const cards = useMemo(
        () => [
            {
                title: "Người dùng",
                value: totals.users,
                icon: <UserOutlined />,
            },
            {
                title: "Công ty",
                value: totals.companies,
                icon: <ApartmentOutlined />,
            },
            {
                title: "Tin tuyển dụng",
                value: totals.jobs,
                icon: <TeamOutlined />,
            },
            {
                title: "Hồ sơ ứng tuyển",
                value: totals.resumes,
                icon: <FileSearchOutlined />,
            },
        ],
        [totals]
    );

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.dashboardHeaderRow}>
                <div>
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        Tổng quan hệ thống
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        Theo dõi nhanh dữ liệu vận hành của trang quản trị.
                    </Typography.Text>
                </div>
                <Tag
                    icon={<ReloadOutlined />}
                    color="blue"
                    className={styles.refreshTag}
                    onClick={fetchDashboardData}
                >
                    Làm mới dữ liệu
                </Tag>
            </div>

            <Row gutter={[16, 16]}>
                {cards.map((card) => (
                    <Col span={24} sm={12} xl={6} key={card.title}>
                        <Card loading={isLoading} className={styles.dashboardCard}>
                            <Space direction="vertical" size={4}>
                                <Space>
                                    <span className={styles.cardIcon}>{card.icon}</span>
                                    <Typography.Text type="secondary">{card.title}</Typography.Text>
                                </Space>
                                <Statistic value={card.value} formatter={formatter} />
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} className={styles.dashboardLists}>
                <Col span={24} lg={12}>
                    <Card title="Tin tuyển dụng mới" loading={isLoading} className={styles.dashboardCard}>
                        <List
                            dataSource={recentJobs}
                            locale={{ emptyText: <Empty description="Chưa có tin tuyển dụng" /> }}
                            renderItem={(item) => (
                                <List.Item key={item.id || item.name}>
                                    <List.Item.Meta
                                        title={item.name || "Không có tiêu đề"}
                                        description={`Công ty: ${item.companyName || "Chưa cập nhật"}`}
                                    />
                                    <Typography.Text type="secondary">{formatDate(item.createdAt)}</Typography.Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col span={24} lg={12}>
                    <Card title="Hồ sơ ứng tuyển mới" loading={isLoading} className={styles.dashboardCard}>
                        <List
                            dataSource={recentResumes}
                            locale={{ emptyText: <Empty description="Chưa có hồ sơ ứng tuyển" /> }}
                            renderItem={(item) => (
                                <List.Item key={item.id || item.email}>
                                    <List.Item.Meta
                                        title={item.email || "Ẩn email"}
                                        description={
                                            <Tag color={statusColor(item.status)}>
                                                {item.status || "UNKNOWN"}
                                            </Tag>
                                        }
                                    />
                                    <Typography.Text type="secondary">{formatDate(item.createdAt)}</Typography.Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;