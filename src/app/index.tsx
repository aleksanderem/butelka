import type { JSX } from "react";

import { Screen } from "@/components/screen";
import { useGame } from "@/game/use-game";
import { ApprovalModal } from "@/screens/approval-modal";
import { CategoriesScreen } from "@/screens/categories-screen";
import { GlobalSettingsScreen } from "@/screens/global-settings-screen";
import { LeaveConfirmDialog } from "@/screens/leave-confirm-dialog";
import { OnboardingScreen } from "@/screens/onboarding-screen";
import { RoomScreen } from "@/screens/room-screen";
import { SettingsScreen } from "@/screens/settings-screen";
import { StartScreen } from "@/screens/start-screen";

export default function HomeScreen(): JSX.Element {
  const game = useGame();

  return (
    <Screen>
      {game.stage === "entry" ? (
        game.globalSettingsOpen ? (
          <GlobalSettingsScreen game={game} />
        ) : game.categoriesOpen ? (
          <CategoriesScreen game={game} />
        ) : (
          <StartScreen game={game} />
        )
      ) : game.stage === "profile" ? (
        <OnboardingScreen game={game} />
      ) : game.settingsOpen ? (
        <SettingsScreen game={game} />
      ) : (
        <RoomScreen game={game} />
      )}

      <ApprovalModal game={game} />
      <LeaveConfirmDialog game={game} />
    </Screen>
  );
}
