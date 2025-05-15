"use client"
import type React from "react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useState } from "react"
import { signUp } from "~/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"



export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isError, setIsError] = useState(false)


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setIsSuccess(false)
        setIsError(false)
        try {
            const response = await signUp.email({ email, password, name: `${firstName} ${lastName}` })
            if (response.error) {
                if (response.error.message === "User already exists") { 
                    toast.error("El usuario ya existe")
                } else if (response.error.message === "Password too short") {
                    toast.error("La contraseña debe tener al menos 8 caracteres")
                } else {
                    toast.error(response.error.message)
                }
                setIsError(true)
            } else {
                // redirect to home
                toast.success("Cuenta creada correctamente")
                router.push("/login")
            }
        } catch (error) {
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirstName(e.target.value)
    }

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastName(e.target.value)
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    return (
      <div className={cn("flex flex-col w-full max-w-md mx-auto", className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Registrarse</CardTitle>
          <CardDescription>Crea una cuenta llenando el siguiente formulario</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" name="firstName" placeholder="John" required
                    value={firstName}
                    onChange={handleFirstNameChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" name="lastName" placeholder="Doe" required
                    value={lastName}
                    onChange={handleLastNameChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" required
                    value={email}
                    onChange={handleEmailChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="********" required
                    value={password}
                    onChange={handlePasswordChange}
                />
              </div>
              <Button type="submit" className="w-full">
                Crear cuenta
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Ya tienes una cuenta?{" "}
              <a href="/login" className="underline underline-offset-4">
                Ingresar
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
