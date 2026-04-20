import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import { ArrowRightOutlined, CheckCircleFilled, SafetyCertificateFilled, ThunderboltFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className={styles["home-page"]}>
            <div className={styles["hero-section"]}>
                <div className={`${styles["container"]} ${styles["home-section"]}`}>
                    <div className={styles["hero-grid"]}>
                        <div className={styles["hero-copy"]}>
                            <span className={styles["eyebrow"]}>Nền tảng tuyển dụng dành cho dân công nghệ</span>
                            <h2>Tìm công việc IT tốt hơn, nhanh hơn và rõ ràng hơn</h2>
                            <p>
                                Từ thực tập, fresher đến senior, tất cả được sắp xếp thành một trải nghiệm gọn,
                                đẹp và dễ tìm kiếm hơn cho cả ứng viên lẫn nhà tuyển dụng.
                            </p>
                            <div className={styles["hero-badges"]}>
                                <span><CheckCircleFilled /> Tin tuyển dụng đã được tổng hợp</span>
                                <span><ThunderboltFilled /> Tìm kiếm nhanh theo kỹ năng</span>
                                <span><SafetyCertificateFilled /> Giao diện dễ đọc trên mọi thiết bị</span>
                            </div>
                            <div className={styles["hero-actions"]}>
                                <Link to="/job" className={styles["primary-cta"]}>
                                    Khám phá việc làm <ArrowRightOutlined />
                                </Link>
                                <Link to="/company" className={styles["secondary-cta"]}>
                                    Xem top công ty
                                </Link>
                            </div>
                        </div>
                        <div className={styles["hero-panel"]}>
                            <div className={styles["search-content"]}>
                                <SearchClient />
                            </div>
                            <div className={styles["hero-stats"]}>
                                <div>
                                    <strong>500+</strong>
                                    <span>tin tuyển dụng mới</span>
                                </div>
                                <div>
                                    <strong>120+</strong>
                                    <span>doanh nghiệp công nghệ</span>
                                </div>
                                <div>
                                    <strong>24/7</strong>
                                    <span>sẵn sàng cho ứng viên</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${styles["container"]} ${styles["trust-section"]}`}>
                <div className={styles["trust-card"]}>
                    <span>UI mới sạch sẽ hơn</span>
                    <p>Bố cục thông thoáng, khối nội dung tách bạch và card được chăm lại để dễ quét thông tin.</p>
                </div>
                <div className={styles["trust-card"]}>
                    <span>Tập trung vào chuyển đổi</span>
                    <p>Nút bấm rõ ràng, thanh tìm kiếm nổi bật và các section chính được dẫn hướng dễ mắt hơn.</p>
                </div>
                <div className={styles["trust-card"]}>
                    <span>Responsive gọn gàng</span>
                    <p>Header, hero, card và footer được bố trí lại để lên mobile vẫn đẹp và đọc dễ chịu.</p>
                </div>
            </div>
            <div className={`${styles["container"]} ${styles["home-section"]}`}>
                <CompanyCard />
                <JobCard />
            </div>
        </div>
    )
}

export default HomePage;
