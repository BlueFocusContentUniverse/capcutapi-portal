"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserFormData = {
  username: string;
  nickname: string;
  gender: string;
  birthday: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  wechatOpenid: string;
};

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const normalizeGender = (g?: string): string => {
    if (!g) return "";
    if (g === "Male") return "男";
    if (g === "Female") return "女";
    if (g === "男" || g === "女") return g;
    return "";
  };

  const [formData, setFormData] = useState<UserFormData>({
    username: initialData?.username || "",
    nickname: initialData?.nickname || "",
    gender: normalizeGender(initialData?.gender),
    birthday: initialData?.birthday?.split("T")[0] || "",
    phone: initialData?.phone || "",
    province: initialData?.province || "",
    city: initialData?.city || "",
    district: initialData?.district || "",
    wechatOpenid: initialData?.wechatOpenid || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={!!initialData}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
                disabled={!!initialData}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">性别</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="男">男</SelectItem>
                  <SelectItem value="女">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday">生日</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wechatOpenid">微信 OpenID</Label>
              <Input
                id="wechatOpenid"
                value={formData.wechatOpenid}
                onChange={(e) => handleChange("wechatOpenid", e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">省份</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => handleChange("province", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">城市</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="district">区/县</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleChange("district", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {initialData ? "更新用户" : "创建用户"}
        </Button>
      </div>
    </form>
  );
}
