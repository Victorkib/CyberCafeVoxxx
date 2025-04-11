import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import {
  Settings,
  CreditCard,
  Truck,
  Mail,
  Save,
} from 'lucide-react';
import {
  fetchSettings,
  updateGeneralSettings,
  updatePaymentSettings,
  updateShippingSettings,
  updateEmailSettings,
} from '@/redux/slices/adminSlice';
import axios from 'axios';

const Settings = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    general: {
      storeName: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: '',
      storeDescription: '',
      currency: 'USD',
      timezone: 'UTC'
    },
    payment: {
      stripeEnabled: false,
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalEnabled: false,
      paypalClientId: '',
      paypalSecret: '',
      cashOnDeliveryEnabled: false
    },
    shipping: {
      freeShippingThreshold: 0,
      defaultShippingRate: 0
    },
    email: {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: false
    }
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        general: {
          storeName: settings.general?.storeName || '',
          storeEmail: settings.general?.storeEmail || '',
          storePhone: settings.general?.storePhone || '',
          storeAddress: settings.general?.storeAddress || '',
          storeDescription: settings.general?.storeDescription || '',
          currency: settings.general?.currency || 'USD',
          timezone: settings.general?.timezone || 'UTC'
        },
        payment: {
          stripeEnabled: settings.payment?.stripeEnabled || false,
          stripePublicKey: settings.payment?.stripePublicKey || '',
          stripeSecretKey: settings.payment?.stripeSecretKey || '',
          paypalEnabled: settings.payment?.paypalEnabled || false,
          paypalClientId: settings.payment?.paypalClientId || '',
          paypalSecret: settings.payment?.paypalSecret || '',
          cashOnDeliveryEnabled: settings.payment?.cashOnDeliveryEnabled || false
        },
        shipping: {
          freeShippingThreshold: settings.shipping?.freeShippingThreshold || 0,
          defaultShippingRate: settings.shipping?.defaultShippingRate || 0
        },
        email: {
          smtpHost: settings.email?.smtpHost || '',
          smtpPort: settings.email?.smtpPort || '',
          smtpUser: settings.email?.smtpUser || '',
          smtpPassword: settings.email?.smtpPassword || '',
          smtpSecure: settings.email?.smtpSecure || false
        }
      });
    }
  }, [settings]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (section) => {
    const updateActions = {
      general: updateGeneralSettings,
      payment: updatePaymentSettings,
      shipping: updateShippingSettings,
      email: updateEmailSettings
    };

    try {
      await dispatch(updateActions[section](formData[section])).unwrap();
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('general'); }}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={formData.general.storeName}
                      onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="storeEmail">Store Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={formData.general.storeEmail}
                      onChange={(e) => handleInputChange('general', 'storeEmail', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="storePhone">Store Phone</Label>
                    <Input
                      id="storePhone"
                      value={formData.general.storePhone}
                      onChange={(e) => handleInputChange('general', 'storePhone', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="storeAddress">Store Address</Label>
                    <Input
                      id="storeAddress"
                      value={formData.general.storeAddress}
                      onChange={(e) => handleInputChange('general', 'storeAddress', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="storeDescription">Store Description</Label>
                    <Input
                      id="storeDescription"
                      value={formData.general.storeDescription}
                      onChange={(e) => handleInputChange('general', 'storeDescription', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={formData.general.currency}
                      onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={formData.general.timezone}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Save General Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('payment'); }}>
                <div className="grid gap-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Stripe</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="stripeEnabled"
                        checked={formData.payment.stripeEnabled}
                        onChange={(e) => handleInputChange('payment', 'stripeEnabled', e.target.checked)}
                      />
                      <Label htmlFor="stripeEnabled">Enable Stripe</Label>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stripePublicKey">Public Key</Label>
                      <Input
                        id="stripePublicKey"
                        type="password"
                        value={formData.payment.stripePublicKey}
                        onChange={(e) => handleInputChange('payment', 'stripePublicKey', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stripeSecretKey">Secret Key</Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={formData.payment.stripeSecretKey}
                        onChange={(e) => handleInputChange('payment', 'stripeSecretKey', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">PayPal</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="paypalEnabled"
                        checked={formData.payment.paypalEnabled}
                        onChange={(e) => handleInputChange('payment', 'paypalEnabled', e.target.checked)}
                      />
                      <Label htmlFor="paypalEnabled">Enable PayPal</Label>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paypalClientId">Client ID</Label>
                      <Input
                        id="paypalClientId"
                        type="password"
                        value={formData.payment.paypalClientId}
                        onChange={(e) => handleInputChange('payment', 'paypalClientId', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paypalSecret">Secret</Label>
                      <Input
                        id="paypalSecret"
                        type="password"
                        value={formData.payment.paypalSecret}
                        onChange={(e) => handleInputChange('payment', 'paypalSecret', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Cash on Delivery</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cashOnDeliveryEnabled"
                        checked={formData.payment.cashOnDeliveryEnabled}
                        onChange={(e) => handleInputChange('payment', 'cashOnDeliveryEnabled', e.target.checked)}
                      />
                      <Label htmlFor="cashOnDeliveryEnabled">Enable Cash on Delivery</Label>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    Save Payment Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('shipping'); }}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      value={formData.shipping.freeShippingThreshold}
                      onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="defaultShippingRate">Default Shipping Rate</Label>
                    <Input
                      id="defaultShippingRate"
                      type="number"
                      value={formData.shipping.defaultShippingRate}
                      onChange={(e) => handleInputChange('shipping', 'defaultShippingRate', parseFloat(e.target.value))}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Save Shipping Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('email'); }}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={formData.email.smtpHost}
                      onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={formData.email.smtpPort}
                      onChange={(e) => handleInputChange('email', 'smtpPort', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={formData.email.smtpUser}
                      onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={formData.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="smtpSecure"
                      checked={formData.email.smtpSecure}
                      onChange={(e) => handleInputChange('email', 'smtpSecure', e.target.checked)}
                    />
                    <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
                  </div>
                  <Button type="submit" disabled={loading}>
                    Save Email Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 