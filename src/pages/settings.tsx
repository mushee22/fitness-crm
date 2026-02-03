import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                <p className="text-slate-600 mt-1">Manage your account and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="bg-white border border-slate-200">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900">Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700">Name</Label>
                                <Input id="name" defaultValue="Admin User" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">Email</Label>
                                <Input id="email" type="email" defaultValue="admin@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-slate-700">Bio</Label>
                                <Input
                                    id="bio"
                                    defaultValue="Administrator of the dashboard"
                                />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900">Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-slate-900">Email Notifications</Label>
                                    <p className="text-sm text-slate-500">
                                        Receive email about your account activity
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-slate-900">Push Notifications</Label>
                                    <p className="text-sm text-slate-500">
                                        Receive push notifications in your browser
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
