"use client"

import { useState, useEffect } from "react"

interface UserData {
    email: string
    testsAttempted: string[]
    totalAttempts: number
    lastActive: string
}

interface AdminStats {
    registeredUsers: number
    guestSessions: number
    totalTests: number
    guestLastSeen: string | null
}

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Password protection state
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [authError, setAuthError] = useState<string | null>(null)
    const [authLoading, setAuthLoading] = useState(false)

    useEffect(() => {
        // Check if already authenticated in session
        const auth = sessionStorage.getItem("admin_auth")
        if (auth === "true") {
            setIsAuthenticated(true)
            fetchStats()
        } else {
            setLoading(false)
        }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setAuthLoading(true)
        setAuthError(null)

        try {
            const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            })
            const data = await res.json()

            if (data.success) {
                sessionStorage.setItem("admin_auth", "true")
                setIsAuthenticated(true)
                fetchStats()
            } else {
                setAuthError("Invalid password")
            }
        } catch {
            setAuthError("Authentication failed")
        } finally {
            setAuthLoading(false)
        }
    }

    const fetchStats = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/stats")
            const data = await res.json()

            if (data.success) {
                setStats(data.stats)
                setUsers(data.users)
            } else {
                setError(data.error || "Failed to load stats")
            }
        } catch {
            setError("Failed to connect to server")
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "Never"
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const formatTestName = (testId: string) => {
        return testId
            .replace(/_/g, " ")
            .replace(/see /i, "SEE ")
            .replace(/generated/i, "")
            .trim()
    }

    // Text styles for light theme
    const darkText: React.CSSProperties = { color: "#1f2937" }
    const grayText: React.CSSProperties = { color: "#6b7280" }
    const mutedText: React.CSSProperties = { color: "#9ca3af" }

    // Password login screen
    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem"
            }}>
                <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "2rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    width: "100%",
                    maxWidth: "400px"
                }}>
                    <h1 style={{ ...darkText, fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", textAlign: "center" }}>
                        Admin Access
                    </h1>
                    <p style={{ ...grayText, textAlign: "center", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
                        Enter password to continue
                    </p>

                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                borderRadius: "8px",
                                border: "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.1)",
                                color: "#ffffff",
                                fontSize: "1rem",
                                marginBottom: "1rem",
                                outline: "none"
                            }}
                        />

                        {authError && (
                            <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1rem", textAlign: "center" }}>
                                {authError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={authLoading || !password}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                border: "none",
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                color: "#ffffff",
                                fontSize: "1rem",
                                fontWeight: "500",
                                cursor: authLoading || !password ? "not-allowed" : "pointer",
                                opacity: authLoading || !password ? 0.6 : 1
                            }}
                        >
                            {authLoading ? "Verifying..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ ...darkText, fontSize: "1rem" }}>Loading...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#dc2626" }}>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            padding: "2rem"
        }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ ...darkText, fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                        Admin Dashboard
                    </h1>
                    <p style={grayText}>Monitor user activity and site usage</p>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem"
                }}>
                    <StatCard

                        label="Registered Users"
                        value={stats?.registeredUsers || 0}
                        color="#4ade80"
                    />
                    <StatCard

                        label="Guest Sessions"
                        value={stats?.guestSessions || 0}
                        subtitle={stats?.guestLastSeen ? `Last: ${formatDate(stats.guestLastSeen)}` : undefined}
                        color="#60a5fa"
                    />
                    <StatCard

                        label="Total Tests"
                        value={stats?.totalTests || 0}
                        color="#f472b6"
                    />
                </div>

                {/* Users Table */}
                <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ ...darkText, fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
                        Registered Users
                    </h2>

                    {users.length === 0 ? (
                        <p style={{ ...grayText, textAlign: "center", padding: "2rem" }}>
                            No registered users yet
                        </p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                        <th style={{ ...grayText, textAlign: "left", padding: "0.75rem" }}>Email</th>
                                        <th style={{ ...grayText, textAlign: "left", padding: "0.75rem" }}>Tests Attempted</th>
                                        <th style={{ ...grayText, textAlign: "center", padding: "0.75rem" }}>Total Attempts</th>
                                        <th style={{ ...grayText, textAlign: "right", padding: "0.75rem" }}>Last Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr
                                            key={user.email}
                                            style={{
                                                borderBottom: "1px solid #f1f5f9",
                                                background: idx % 2 === 0 ? "transparent" : "#f8fafc"
                                            }}
                                        >
                                            <td style={{ ...darkText, padding: "0.75rem", fontWeight: "500" }}>
                                                {user.email}
                                            </td>
                                            <td style={{ padding: "0.75rem" }}>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                                                    {user.testsAttempted.slice(0, 3).map(test => (
                                                        <span
                                                            key={test}
                                                            style={{
                                                                background: "rgba(99, 102, 241, 0.2)",
                                                                color: "#a5b4fc",
                                                                padding: "0.125rem 0.5rem",
                                                                borderRadius: "9999px",
                                                                fontSize: "0.75rem"
                                                            }}
                                                        >
                                                            {formatTestName(test)}
                                                        </span>
                                                    ))}
                                                    {user.testsAttempted.length > 3 && (
                                                        <span style={{ ...mutedText, fontSize: "0.75rem" }}>
                                                            +{user.testsAttempted.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                                <span style={{
                                                    background: "rgba(74, 222, 128, 0.2)",
                                                    color: "#4ade80",
                                                    padding: "0.25rem 0.75rem",
                                                    borderRadius: "9999px",
                                                    fontSize: "0.875rem"
                                                }}>
                                                    {user.totalAttempts}
                                                </span>
                                            </td>
                                            <td style={{ ...grayText, padding: "0.75rem", textAlign: "right" }}>
                                                {formatDate(user.lastActive)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Refresh Button */}
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <button
                        onClick={() => fetchStats()}
                        style={{
                            background: "rgba(99, 102, 241, 0.2)",
                            color: "#a5b4fc",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            padding: "0.5rem 1.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, subtitle, color }: {
    label: string
    value: number
    subtitle?: string
    color: string
}) {
    return (
        <div style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)"
        }}>
            <div style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color,
                marginBottom: "0.25rem"
            }}>
                {value.toLocaleString()}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>{label}</div>
            {subtitle && (
                <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {subtitle}
                </div>
            )}
        </div>
    )
}
