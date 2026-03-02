import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@hrdesk.com', password: 'Admin@1234' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { label: 'Admin', email: 'admin@hrdesk.com', password: 'Admin@1234', color: '#4F46E5' },
    { label: 'HR', email: 'hr@hrdesk.com', password: 'Hr@1234', color: '#06B6D4' },
    { label: 'Employee', email: 'john@hrdesk.com', password: 'Emp@1234', color: '#10B981' },
  ];

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = -(e.clientY - rect.top - rect.height / 2) / 20;
    setTilt({ x, y });
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #0f172a, #020617 60%)',
      }}
    >
      <Card
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="shadow-lg overflow-hidden"
        style={{
          width: 900,
          borderRadius: 18,
          background: 'rgba(15,23,42,0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56,189,248,0.3)',
          transform: `
            perspective(1000px)
            rotateX(${tilt.y}deg)
            rotateY(${tilt.x}deg)
            translateY(${mounted ? '0px' : '40px'})
          `,
          opacity: mounted ? 1 : 0,
          transition: 'all 0.8s ease',
          boxShadow: '0 0 60px rgba(56,189,248,0.25)',
        }}
      >
        <Row className="g-0">
          {/* Left */}
          <Col md={7} className="p-5 text-light">
            <h3 className="fw-bold mb-1">Login</h3>
            <p className="text-secondary mb-4">Sign in to your workspace</p>

            <div className="mb-4">
              <small className="text-uppercase text-secondary fw-bold">Quick Demo</small>
              <div className="d-flex gap-2 flex-wrap mt-2">
                {demoLogins.map((d, i) => (
                  <Badge
                    key={d.label}
                    onClick={() => setForm({ email: d.email, password: d.password })}
                    style={{
                      cursor: 'pointer',
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: `1px solid ${d.color}`,
                      color: d.color,
                      background: 'transparent',
                      transition: 'transform .2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {d.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #64748b',
                    color: '#e5e7eb',
                    transition: 'border-color .3s',
                  }}
                  onFocus={e => (e.target.style.borderBottom = '2px solid #38BDF8')}
                  onBlur={e => (e.target.style.borderBottom = '2px solid #64748b')}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter password"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '2px solid #64748b',
                      color: '#e5e7eb',
                      transition: 'border-color .3s',
                    }}
                    onFocus={e => (e.target.style.borderBottom = '2px solid #38BDF8')}
                    onBlur={e => (e.target.style.borderBottom = '2px solid #64748b')}
                  />
                  <Button
                    variant="link"
                    className="text-info"
                    onClick={() => setShowPass(p => !p)}
                  >
                    <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </Button>
                </div>
              </Form.Group>

              <Button
                type="submit"
                disabled={loading}
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                style={{
                  borderRadius: 25,
                  height: 46,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  background: 'linear-gradient(135deg, #38BDF8, #22D3EE)',
                  border: 'none',
                  color: '#020617',
                  boxShadow: '0 0 25px rgba(56,189,248,0.7)',
                  transition: 'transform .15s ease, box-shadow .15s ease',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </Form>
          </Col>

          {/* Right */}
          <Col
            md={5}
            className="d-flex align-items-center justify-content-center text-center fw-bold"
            style={{
              background: 'linear-gradient(135deg, #0EA5E9, #22D3EE)',
              clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
              color: '#020617',
              fontSize: 36,
              letterSpacing: 2,
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            WELCOME <br /> BACK!
          </Col>
        </Row>
      </Card>
    </Container>
  );
}