import { Button, Form, Input, Steps, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callForgotPassword, callResetPassword, callVerifyOtp } from '@/config/api';
import styles from 'styles/auth.module.scss';

const ForgotPasswordPage = () => {
    const [emailForm] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleError = (res: any) => {
        notification.error({
            message: 'Có lỗi xảy ra',
            description: res?.message && Array.isArray(res.message) ? res.message[0] : (res?.message || res?.error || 'Vui lòng thử lại'),
            duration: 5
        });
    };

    const submitEmail = async (values: { email: string }) => {
        setIsSubmitting(true);
        const res = await callForgotPassword(values.email);
        setIsSubmitting(false);

        if (res?.statusCode === 200) {
            setEmail(values.email);
            setCurrentStep(1);
            message.success('OTP đã được gửi về email của bạn');
        } else {
            handleError(res);
        }
    };

    const submitOtp = async (values: { otp: string }) => {
        setIsSubmitting(true);
        const res = await callVerifyOtp(email, values.otp);
        setIsSubmitting(false);

        if (res?.statusCode === 200) {
            setCurrentStep(2);
            message.success('Xác thực OTP thành công');
        } else {
            handleError(res);
        }
    };

    const resendOtp = async () => {
        if (!email) return;
        setIsSubmitting(true);
        const res = await callForgotPassword(email);
        setIsSubmitting(false);

        if (res?.statusCode === 200) {
            message.success('OTP mới đã được gửi lại');
        } else {
            handleError(res);
        }
    };

    const submitResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
        setIsSubmitting(true);
        const res = await callResetPassword(email, values.newPassword);
        setIsSubmitting(false);

        if (res?.statusCode === 200) {
            message.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập lại');
            navigate('/login');
        } else {
            handleError(res);
        }
    };

    return (
        <div className={styles['login-page']}>
            <main className={styles['auth-main']}>
                <div className={styles['auth-center']}>
                    <section className={`${styles.wrapper} ${styles['forgot-wrapper']}`}>
                        <h1 className={styles['login-title']}>Quên mật khẩu</h1>
                        <p className={styles['forgot-description']}>
                            Nhập email, xác thực OTP rồi đặt mật khẩu mới cho tài khoản của bạn.
                        </p>

                        <Steps
                            current={currentStep}
                            size="small"
                            className={styles['forgot-steps']}
                            items={[
                                { title: 'Email' },
                                { title: 'OTP' },
                                { title: 'Mật khẩu mới' },
                            ]}
                        />

                        {currentStep === 0 && (
                            <Form
                                form={emailForm}
                                layout="vertical"
                                onFinish={submitEmail}
                                className={styles['login-form']}
                            >
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Email không được để trống' },
                                        { type: 'email', message: 'Email không đúng định dạng' },
                                    ]}
                                >
                                    <Input size="large" placeholder="name@example.com" />
                                </Form.Item>

                                <Form.Item className={styles['submit-wrap']}>
                                    <Button type="primary" htmlType="submit" loading={isSubmitting} block size="large" className={styles['login-submit']}>
                                        Gửi OTP
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}

                        {currentStep === 1 && (
                            <Form
                                form={otpForm}
                                layout="vertical"
                                onFinish={submitOtp}
                                className={styles['login-form']}
                            >
                                <Form.Item label="Email">
                                    <Input size="large" value={email} disabled />
                                </Form.Item>

                                <Form.Item
                                    label="Mã OTP"
                                    name="otp"
                                    rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }]}
                                >
                                    <Input size="large" placeholder="Nhập mã OTP gồm 6 số" maxLength={6} />
                                </Form.Item>

                                <Form.Item className={styles['submit-wrap']}>
                                    <Button type="primary" htmlType="submit" loading={isSubmitting} block size="large" className={styles['login-submit']}>
                                        Xác thực OTP
                                    </Button>
                                </Form.Item>

                                <Button type="link" onClick={resendOtp} disabled={isSubmitting} className={styles['resend-link']}>
                                    Gửi lại OTP
                                </Button>
                            </Form>
                        )}

                        {currentStep === 2 && (
                            <Form
                                form={resetForm}
                                layout="vertical"
                                onFinish={submitResetPassword}
                                className={styles['login-form']}
                            >
                                <Form.Item
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                        { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                                    ]}
                                >
                                    <Input.Password size="large" placeholder="Nhập mật khẩu mới" autoComplete="new-password" />
                                </Form.Item>

                                <Form.Item
                                    label="Nhập lại mật khẩu mới"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" />
                                </Form.Item>

                                <Form.Item className={styles['submit-wrap']}>
                                    <Button type="primary" htmlType="submit" loading={isSubmitting} block size="large" className={styles['login-submit']}>
                                        Đặt lại mật khẩu
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}

                        <p className={styles['card-footer-text']}>
                            Đã nhớ mật khẩu?{' '}
                            <Link to="/login" className={styles['card-footer-link']}>
                                Quay lại đăng nhập
                            </Link>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ForgotPasswordPage;
