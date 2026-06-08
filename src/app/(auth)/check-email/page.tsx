import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent you a confirmation link. Click it to activate your account and start swapping plants.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Didn&apos;t receive it? Check your spam folder.</p>
          <p className="mt-4">
            Already confirmed?{' '}
            <Link href="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
