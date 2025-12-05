import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Toggle } from '@/components/ui/toggle'; // Assume exists
// import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'; // Assume exists

export default function Profile() {
  // Local state for personal info
  const [personal, setPersonal] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@email.com',
    phone: '555-123-4567',
  });
  const [editingPersonal, setEditingPersonal] = useState(false);

  // Local state for preferences
  const [preferences, setPreferences] = useState({
    notifications: true,
    display: 'dark',
  });

  // Dummy payment info
  const payment = {
    cardType: 'Visa',
    masked: '**** **** **** 1234',
    expiry: '12/28',
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Personal Information */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>View and update your profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  value={personal.firstName}
                  disabled={!editingPersonal}
                  onChange={e => setPersonal(p => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={personal.lastName}
                  disabled={!editingPersonal}
                  onChange={e => setPersonal(p => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={personal.email}
                  disabled={!editingPersonal}
                  onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  value={personal.phone}
                  disabled={!editingPersonal}
                  onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            {editingPersonal ? (
              <>
                <Button size="sm" onClick={() => setEditingPersonal(false)} variant="outline">Cancel</Button>
                <Button size="sm" onClick={() => setEditingPersonal(false)}>Save</Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setEditingPersonal(true)}>Edit</Button>
            )}
          </CardFooter>
        </Card>

        {/* Payment Details */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Manage your saved payment methods.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <div className="text-lg font-semibold mb-1">{payment.cardType}</div>
              <div className="text-muted-foreground mb-1">{payment.masked}</div>
              <div className="text-muted-foreground text-sm">Expires {payment.expiry}</div>
            </div>
            <Button size="sm">Update Card</Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Email Notifications</span>
              {/* <Toggle checked={preferences.notifications} onCheckedChange={v => setPreferences(p => ({ ...p, notifications: v }))} /> */}
              <Button size="sm" variant={preferences.notifications ? 'default' : 'outline'} onClick={() => setPreferences(p => ({ ...p, notifications: !p.notifications }))}>
                {preferences.notifications ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Display Mode</span>
              <select
                className="border rounded-md px-3 py-1 text-sm bg-background"
                value={preferences.display}
                onChange={e => setPreferences(p => ({ ...p, display: e.target.value }))}
              >
                <option value="en">Dark</option>
                <option value="es">Light</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button size="sm">Save Preferences</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
