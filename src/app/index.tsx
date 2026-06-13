import type { JSX } from "react";

import { Screen } from "@/components/screen";
import { useGame } from "@/game/use-game";
import { ApprovalModal } from "@/screens/approval-modal";
import { OnboardingScreen } from "@/screens/onboarding-screen";
import { RoomScreen } from "@/screens/room-screen";
import { SettingsScreen } from "@/screens/settings-screen";
import { StartScreen } from "@/screens/start-screen";

export default function HomeScreen(): JSX.Element {
  const game = useGame();

  return (
    <Screen>
      {game.stage === "entry" ? (
        <StartScreen game={game} />
      ) : game.stage === "profile" ? (
        <OnboardingScreen game={game} />
      ) : game.settingsOpen ? (
        <SettingsScreen game={game} />
      ) : (
        <RoomScreen game={game} />
      )}

      <ApprovalModal game={game} />
    </Screen>
  );
}
