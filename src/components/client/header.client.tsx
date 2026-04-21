import { useState, useEffect } from 'react';
import { AppstoreOutlined, CodeOutlined, ContactsOutlined, FireOutlined, LogoutOutlined, MenuFoldOutlined, RiseOutlined, TwitterOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, MenuProps, Space, message } from 'antd';
import { Menu } from 'antd';
import styles from '@/styles/client.module.scss';
import { isMobile } from 'react-device-detect';
import { FaReact } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import JobMegaMenu from './job/job-mega-menu';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

    const [current, setCurrent] = useState('home');
    const location = useLocation();

    const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location])

    const items: MenuProps['items'] = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: '/',
            icon: <TwitterOutlined />,
        },
        {
            label: <Link to={'/job'}>Việc làm IT</Link>,
            key: '/job',
            icon: <CodeOutlined />,
        },
        {
            label: <Link to={'/company'}>Top công ty IT</Link>,
            key: '/company',
            icon: <RiseOutlined />,
        },
        {
            label: <Link to={'/skills'}>Kỹ năng</Link>,
            key: '/skills',
            icon: <AppstoreOutlined />,
        }
    ];

    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const itemsDropdown = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => setOpenManageAccount(true)}
            >Quản lý tài khoản</label>,
            key: 'manage-account',
            icon: <ContactsOutlined />
        },
        ...(user.role?.permissions?.length ? [{
            label: <Link
                to={"/admin"}
            >Trang quản trị</Link>,
            key: 'admin',
            icon: <FireOutlined />
        },] : []),

        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    const itemsMobiles = [...items, ...itemsDropdown];

    return (
        <>
            <div className={styles["header-section"]}>
                <div className={styles["container"]}>
                    {!isMobile ?
                        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                            <div className={styles['brand']} >
                                <div className={styles["brand-mark"]} onClick={() => navigate('/')} title='FindJobs'>
                                    <FaReact />
                                </div>
                                <div className={styles["brand-copy"]} onClick={() => navigate('/')}>
                                    <strong>FindJobs</strong>
                                    <span>Nơi lập trình viên chọn đúng hướng đi</span>
                                </div>
                            </div>
                            <div className={styles['top-menu']}>
                                <div className={styles["desktop-nav"]}>
                                    <Link className={current === '/' ? styles["nav-active"] : styles["nav-link"]} to={'/'}>
                                        Trang chủ
                                    </Link>
                                    <Dropdown
                                        trigger={['hover']}
                                        placement="bottomLeft"
                                        dropdownRender={() => <JobMegaMenu />}
                                    >
                                        <span className={current.startsWith('/job') ? styles["nav-active"] : styles["nav-link"]}>
                                            Việc làm IT
                                        </span>
                                    </Dropdown>
                                    <Link className={current === '/company' ? styles["nav-active"] : styles["nav-link"]} to={'/company'}>
                                        Top công ty IT
                                    </Link>
                                    <Link className={current === '/skills' ? styles["nav-active"] : styles["nav-link"]} to={'/skills'}>
                                        Kỹ năng
                                    </Link>
                                </div>
                                <div className={styles['extra']}>
                                    {isAuthenticated === false ?
                                        <div className={styles["guest-actions"]}>
                                            <span className={styles["employer-link"]}>Không gian dành cho nhà tuyển dụng</span>
                                            <Link to={'/login'} className={styles["signin-btn"]}>Đăng nhập</Link>
                                        </div>
                                        :
                                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                            <Space style={{ cursor: "pointer" }}>
                                                <span>Xin chào {user?.name}</span>
                                                <Avatar> {user?.name?.substring(0, 2)?.toUpperCase()} </Avatar>
                                            </Space>
                                        </Dropdown>
                                    }

                                </div>

                            </div>
                        </div>
                        :
                        <div className={styles['header-mobile']}>
                            <div className={styles["mobile-brand"]}>
                                <strong>FindJobs</strong>
                                <span>Tìm việc IT dễ hơn mỗi ngày</span>
                            </div>
                            <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
                        </div>
                    }
                </div>
            </div>
            <Drawer title="Chức năng"
                placement="right"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
            >
                <Menu
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="vertical"
                    items={itemsMobiles}
                />
            </Drawer>
            <ManageAccount
                open={openMangeAccount}
                onClose={setOpenManageAccount}
            />
        </>
    )
};

export default Header;
