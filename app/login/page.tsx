import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="font-semibold text-brand text-lg">VI CONNECT</div>
            <p className="text-sm text-muted mt-1">Đăng nhập vào nền tảng</p>
          </div>
          <LoginForm />
          <p className="text-sm text-muted mt-4 text-center">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-brand hover:underline">
              Đăng ký hồ sơ chuyên gia
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
