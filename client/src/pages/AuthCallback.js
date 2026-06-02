import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ERROR_MESSAGES = {
  google_denied: "Вход через Google отменён",
  google_failed: "Не удалось войти через Google"
};

export default function AuthCallback() {
  const { completeOAuthLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const oauthError = params.get("error");
    if (oauthError) {
      setError(ERROR_MESSAGES[oauthError] || "Ошибка авторизации");
      return;
    }

    const token = params.get("token");
    const refreshToken = params.get("refresh");
    const email = params.get("email");

    if (!token || !refreshToken || !email) {
      setError("Неполный ответ от сервера");
      return;
    }

    completeOAuthLogin({
      token,
      refreshToken,
      email,
      name: params.get("name") || "",
      avatarUrl: params.get("avatar") || ""
    });
    navigate("/", { replace: true });
  }, [params, completeOAuthLogin, navigate]);

  return (
    <div className="auth-callback-page">
      {error ? (
        <>
          <p className="checkout-error">{error}</p>
          <Link to="/">← На главную</Link>
        </>
      ) : (
        <p>Вход…</p>
      )}
    </div>
  );
}
