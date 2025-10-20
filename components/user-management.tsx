"use client";

import { Edit, Eye, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { UserForm } from "./user-form";

interface User {
  userId: string;
  username: string;
  nickname: string;
  avatarUrl?: string;
  gender?: string;
  birthday?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  wechatOpenid?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm),
  );

  // const handleAddUser = async (userData: any) => {
  //   try {
  //     const response = await fetch("/api/users", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...userData,
  //         userId: `user_${Date.now()}`,
  //       }),
  //     })
  //     if (response.ok) {
  //       await fetchUsers()
  //       setIsAddDialogOpen(false)
  //     }
  //   } catch (error) {
  //     console.error("Failed to add user:", error)
  //   }
  // }

  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`/api/users/${selectedUser.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        await fetchUsers();
        setIsEditDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  // const handleDeleteUser = async (userId: string) => {
  //   try {
  //     const response = await fetch(`/api/users/${userId}`, {
  //       method: "DELETE",
  //     })
  //     if (response.ok) {
  //       await fetchUsers()
  //     }
  //   } catch (error) {
  //     console.error("Failed to delete user:", error)
  //   }
  // }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载用户中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">
            用户管理
          </h1>
          <p className="text-muted-foreground mt-2">管理用户账户和个人资料</p>
        </div>
        {/* <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              添加用户
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>添加新用户</DialogTitle>
              <DialogDescription>创建新的用户账户</DialogDescription>
            </DialogHeader>
            <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog> */}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总用户数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {users.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日活跃
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {
                users.filter((u) => {
                  if (!u.lastLoginAt) return false;
                  const lastLogin = new Date(u.lastLoginAt);
                  const today = new Date();
                  return lastLogin.toDateString() === today.toDateString();
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              微信用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.wechatOpenid).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              本月新增
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {
                users.filter((u) => {
                  const created = new Date(u.createdAt);
                  const now = new Date();
                  return (
                    created.getMonth() === now.getMonth() &&
                    created.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">用户列表</CardTitle>
          <CardDescription>查看和管理所有用户账户</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="按用户名、昵称或手机号搜索用户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>联系方式</TableHead>
                  <TableHead>位置</TableHead>
                  <TableHead>微信</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.avatarUrl || "/placeholder.svg"}
                            alt={user.username}
                          />
                          <AvatarFallback>
                            {user.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.nickname}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-foreground">
                          {user.phone || "未填写"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.gender || "未填写"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-foreground">
                          {user.city && user.province
                            ? `${user.city}, ${user.province}`
                            : "未填写"}
                        </div>
                        <div className="text-muted-foreground">
                          {user.district || ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.wechatOpenid ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {user.wechatOpenid ? "已连接" : "未连接"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {user.lastLoginAt
                          ? formatDate(user.lastLoginAt)
                          : "从未登录"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.userId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>更新用户信息</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              initialData={selectedUser}
              onSubmit={handleEditUser}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>查看用户信息和活动</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedUser.avatarUrl || "/placeholder.svg"}
                    alt={selectedUser.username}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedUser.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedUser.username}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedUser.nickname}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-foreground mb-2">个人信息</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">性别：</span>{" "}
                      {selectedUser.gender || "未填写"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">生日：</span>{" "}
                      {selectedUser.birthday
                        ? formatDate(selectedUser.birthday)
                        : "未填写"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">手机：</span>{" "}
                      {selectedUser.phone || "未填写"}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">位置信息</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">省份：</span>{" "}
                      {selectedUser.province || "未填写"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">城市：</span>{" "}
                      {selectedUser.city || "未填写"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">区县：</span>{" "}
                      {selectedUser.district || "未填写"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  关闭
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  编辑用户
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
