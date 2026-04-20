import styles from '@/styles/client.module.scss';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className={styles["main-footer"]}>
            <div className={`${styles["container"]} ${styles["footer-shell"]}`}>
                <div className={styles["footer-top"]}>
                    <div className={styles["footer-brand"]}>
                        <strong>FindJobs</strong>
                        <p>
                            Giao diện tìm việc IT gọn gàng, đẹp mắt và rõ ràng hơn cho ứng viên công nghệ.
                        </p>
                    </div>
                    <div className={styles["footer-links-block"]}>
                        <span className={styles["footer-heading"]}>Khám phá</span>
                        <div className={styles["footer-links"]}>
                            <Link to="/">Trang chủ</Link>
                            <Link to="/job">Việc làm</Link>
                            <Link to="/company">Công ty</Link>
                            <Link to="/skills">Kỹ năng</Link>
                        </div>
                    </div>
                    <div className={styles["footer-links-block"]}>
                        <span className={styles["footer-heading"]}>Liên hệ</span>
                        <div className={styles["footer-meta"]}>
                            <span>Email: hello@findjobs.vn</span>
                            <span>Hotline: 0123 456 789</span>
                            <span>Hỗ trợ tuyển dụng và hồ sơ IT</span>
                        </div>
                    </div>
                </div>
                <div className={styles["footer-bottom"]}>
                    <span>© 2026 FindJobs. All rights reserved.</span>
                    <span>Thiết kế lại để trải nghiệm tìm việc hiện đại và dễ dùng hơn.</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer;
