import Image from "next/image";
import "dayjs/locale/es-mx";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { CreateEventModal } from "~/components/createEventModal";
import { useToast } from "~/components/ui/use-toast";
import Link from "next/link";

export const Navbar = () => {
  const { toast } = useToast();
  const { user } = useUser();

  const triggerToast = (success: boolean) => {
    if (!success) {
      toast({
        variant: "destructive",
        title: "Algo salió mal",
        description: "Hubo un problema al crear el evento. Inténtalo más tarde",
      });
      return;
    }
    toast({
      description: "¡El evento ha sido creado!",
    });
  };

  return (
    <nav className="fixed left-0 top-0 z-20 w-full border-b border-slate-200 bg-white dark:border-slate-600 dark:bg-black">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/whimsicott.png"
            width={40}
            height={40}
            className="mr-3"
            alt="Whimsicott"
          />
          <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
            TCGURT
          </span>
        </Link>
        <div className="flex gap-x-4">
          {!!user && !!user?.publicMetadata.isOrganizer && (
            <CreateEventModal
              {...{
                triggerToast: triggerToast,
                userLocation: user.unsafeMetadata.location as string,
              }}
            />
          )}
          {!!user && (
            <div className="pt-[3px]">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
          {!user && (
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-lg bg-green-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                Login
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
};
