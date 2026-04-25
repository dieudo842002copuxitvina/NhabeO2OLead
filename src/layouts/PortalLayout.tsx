import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Props {
  sidebar: ReactNode;
  children: ReactNode;
  title?: string;
}

export default function PortalLayout({ sidebar, children, title }: Props) {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        {sidebar}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-background px-3 sticky top-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger />
              {title && <h1 className="font-display font-semibold text-base truncate">{title}</h1>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm truncate max-w-[160px]">
                    {user?.email ?? 'Khách'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuLabel>
                  <p className="text-xs font-normal text-muted-foreground">Đăng nhập với</p>
                  <p className="text-sm truncate">{user?.email}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Vai trò: {roles.join(', ') || 'customer'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
