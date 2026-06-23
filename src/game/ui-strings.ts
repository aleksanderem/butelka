// Stringi interfejsu aplikacji (PL/EN). Oddzielone od treści gry (kart) — patrz language.ts.
// t("namespace.key") zwraca wariant wg bieżącego języka (getLang), fallback do PL.
// Reaktywność: jak przy treści — zmiana języka (lang w use-game) przerenderowuje ekrany.

import { getLang } from "@/game/language";

interface Entry {
  pl: string;
  en: string;
}

// Słownik UI. Klucze w formacie "<ekran/komponent>.<opis>". Uzupełniany przy lokalizacji ekranów.
export const UI: Record<string, Entry> = {
  "contentLevel.0": { pl: "Wył.", en: "Off" },
  "contentLevel.1": { pl: "Łagodne", en: "Mild" },
  "contentLevel.2": { pl: "Mocniejsze", en: "Bolder" },
  "contentLevel.3": { pl: "Pełne", en: "Full" },
  "contentFilter.no_touch_filter": { pl: "Bez dotyku", en: "No touch" },
  "contentFilter.no_explicit_filter": { pl: "Bez treści explicit", en: "No explicit content" },
  "contentFilter.private_only_filter": { pl: "Tylko prywatne", en: "Private only" },
  "contentFilter.no_drama_filter": { pl: "Bez ex/dram", en: "No ex/drama" },
  "contentFilter.couple_only": { pl: "Tylko we dwoje", en: "Couples only" },
  "contentFilter.group_only": { pl: "Tylko grupowe", en: "Group only" },
  "useGame.testModeLabel": { pl: "Tryb testowy", en: "Test mode" },
  "useGame.testModeOn": {
    pl: "Włączony — funkcje testowe są teraz dostępne.",
    en: "Enabled — test features are now available.",
  },
  "useGame.testModeOff": { pl: "Wyłączony.", en: "Disabled." },
  "useGame.createRoomFailed": {
    pl: "Nie udało się utworzyć pokoju",
    en: "Couldn't create the room",
  },
  "useGame.joinFailed": { pl: "Nie udało się dołączyć", en: "Couldn't join" },
  "useGame.rejoinFailed": {
    pl: "Nie udało się wrócić do sesji",
    en: "Couldn't return to the session",
  },
  "useGame.genericError": {
    pl: "Coś poszło nie tak. Spróbuj ponownie.",
    en: "Something went wrong. Try again.",
  },
  "approvalModal.acceptButton": {
    pl: "Akceptuj",
    en: "Accept",
  },
  "approvalModal.accepted": {
    pl: "Zaakceptowano — wykonuję…",
    en: "Accepted — processing…",
  },
  "approvalModal.actionPrompt": {
    pl: "{initiator} chce {verb}. Czy się zgadzasz?",
    en: "{initiator} wants to {verb}. Do you agree?",
  },
  "approvalModal.approvalsLabel": {
    pl: "Akceptacje",
    en: "Approvals",
  },
  "approvalModal.declined": {
    pl: "Odrzucono — pomijam…",
    en: "Declined — skipping…",
  },
  "approvalModal.endTurnTitle": {
    pl: "Zakończenie tury",
    en: "End Turn",
  },
  "approvalModal.endTurnVerb": {
    pl: "zakończyć turę",
    en: "end the turn",
  },
  "approvalModal.nextDareTitle": {
    pl: "Następne wyzwanie",
    en: "Next Dare",
  },
  "approvalModal.nextDareVerb": {
    pl: "wylosować następne wyzwanie",
    en: "draw the next dare",
  },
  "approvalModal.nextTruthTitle": {
    pl: "Następne pytanie",
    en: "Next Question",
  },
  "approvalModal.nextTruthVerb": {
    pl: "wylosować następne pytanie",
    en: "draw the next question",
  },
  "approvalModal.playerFallback": {
    pl: "Gracz",
    en: "Player",
  },
  "approvalModal.rejectButton": {
    pl: "Odrzuć",
    en: "Reject",
  },
  "approvalModal.selfLabel": {
    pl: "Ty",
    en: "You",
  },
  "approvalModal.voteAsLabel": {
    pl: "Głosuj jako {name}",
    en: "Vote as {name}",
  },
  "approvalModal.voteCast": {
    pl: "Twój głos oddany. Dotknij innego gracza, aby zagłosować w jego imieniu (test).",
    en: "Your vote is cast. Tap another player to vote on their behalf (test).",
  },
  "approvalModal.votesRequired": {
    pl: "Wymagana zgoda {needed} z {total} graczy.",
    en: "{needed} of {total} players must agree.",
  },
  "cardFan.you": {
    pl: "Ty",
    en: "You",
  },
  "categoriesScreen.back": {
    pl: "Wróć",
    en: "Go back",
  },
  "categoriesScreen.subtitle": {
    pl: "Dotknij, by podejrzeć karty",
    en: "Tap to browse cards",
  },
  "categoriesScreen.title": {
    pl: "Kategorie",
    en: "Categories",
  },
  "categoryCard.categoryLabel": {
    pl: "Kategoria",
    en: "Category",
  },
  "categoryDetailScreen.ageGateDescription": {
    pl: "Treści 18+. Potwierdź wiek, aby podejrzeć karty z tej kategorii.",
    en: "18+ content. Confirm your age to preview cards in this category.",
  },
  "categoryDetailScreen.allSubcategories": {
    pl: "Wszystkie podkategorie",
    en: "All subcategories",
  },
  "categoryDetailScreen.backButton": {
    pl: "Wróć",
    en: "Go back",
  },
  "categoryDetailScreen.confirmAge": {
    pl: "Mam 18+",
    en: "I'm 18+",
  },
  "categoryDetailScreen.dare": {
    pl: "Wyzwanie",
    en: "Dare",
  },
  "categoryDetailScreen.examplesCount": {
    pl: "przykładów",
    en: "examples",
  },
  "categoryDetailScreen.loadingCards": {
    pl: "Ładuję karty…",
    en: "Loading cards…",
  },
  "categoryDetailScreen.noCards": {
    pl: "Brak kart tego typu.",
    en: "No cards of this type.",
  },
  "categoryDetailScreen.shuffleOther": {
    pl: "Losuj inne",
    en: "Shuffle",
  },
  "categoryDetailScreen.truth": {
    pl: "Prawda",
    en: "Truth",
  },
  "challengeView.answerHonestly": {
    pl: "Odpowiedz szczerze!",
    en: "Answer honestly!",
  },
  "challengeView.cantDoIt": {
    pl: "Ty nie dasz rady?",
    en: "Can't handle it?",
  },
  "challengeView.dare": {
    pl: "Wyzwanie",
    en: "Dare",
  },
  "challengeView.nextPlayer": {
    pl: "Następny gracz",
    en: "Next player",
  },
  "challengeView.nextPlayerHint": {
    pl: '"Następny gracz" przekazuje turę kolejnej osobie.',
    en: '"Next player" passes the turn to the next person.',
  },
  "challengeView.playerAnswering": {
    pl: "odpowiada — czekajcie na wynik.",
    en: "is answering — wait for the result.",
  },
  "challengeView.playerDoing": {
    pl: "ma wyzwanie — czekajcie na wynik.",
    en: "has a dare — wait for the result.",
  },
  "challengeView.reroll": {
    pl: "Wylosuj inne",
    en: "Pick another",
  },
  "challengeView.timeUpPlayerLost": {
    pl: "Czas minął —",
    en: "Time's up —",
  },
  "challengeView.timeUpYouLost": {
    pl: "Czas minął — przegrałeś!",
    en: "Time's up — you lost!",
  },
  "challengeView.truth": {
    pl: "Prawda",
    en: "Truth",
  },
  "circulatingView.addPlayer": {
    pl: "Dodaj gracza",
    en: "Add player",
  },
  "circulatingView.addTestPlayer": {
    pl: "Dodaj gracza testowego",
    en: "Add test player",
  },
  "circulatingView.cardSpinning": {
    pl: "Karta krąży…",
    en: "Card is spinning…",
  },
  "circulatingView.hostWillStart": {
    pl: "Host za chwilę rozpocznie rundę",
    en: "The host will start the round shortly",
  },
  "circulatingView.needMorePlayers": {
    pl: "Potrzeba co najmniej 2 graczy, aby zacząć.",
    en: "At least 2 players are needed to start.",
  },
  "circulatingView.pickLuckyOne": {
    pl: "Wylosuj, kto zostanie szczęśliwcem",
    en: "Draw who gets to be lucky",
  },
  "circulatingView.readyForRound": {
    pl: "Gotowi na rundę?",
    en: "Ready for a round?",
  },
  "circulatingView.roundStartsAuto": {
    pl: "Runda zacznie się automatycznie",
    en: "Round will start automatically",
  },
  "circulatingView.roundStartsAutoEllipsis": {
    pl: "Runda zacznie się automatycznie…",
    en: "Round will start automatically…",
  },
  "circulatingView.spinButton": {
    pl: "Losuj szczęśliwca",
    en: "Pick the lucky one",
  },
  "circulatingView.waitForHost": {
    pl: "Czekajcie, aż host rozpocznie rundę",
    en: "Wait for the host to start the round",
  },
  "circulatingView.waitForLuck": {
    pl: "Czekajcie, na kogo wskaże los",
    en: "Wait and see who luck picks",
  },
  "circulatingView.waitingForPlayers": {
    pl: "Czekam na co najmniej 2 graczy…",
    en: "Waiting for at least 2 players…",
  },
  "circulatingView.you": {
    pl: "Ty",
    en: "You",
  },
  "contentLevelEditor.adultContentDescription": {
    pl: "Te tryby zawierają treści 18+ (flirt, dotyk, seksualne pytania). Potwierdź, że Ty i gracze macie ukończone 18 lat.",
    en: "These modes contain 18+ content (flirting, touch, sexual questions). Confirm that you and all players are 18 or older.",
  },
  "contentLevelEditor.adultContentTitle": {
    pl: "Treści dla dorosłych",
    en: "Adult content",
  },
  "contentLevelEditor.confirmAge": {
    pl: "Potwierdź wiek 18+, aby włączyć",
    en: "Confirm you're 18+ to enable",
  },
  "contentLevelEditor.contentFilters": {
    pl: "Filtry treści",
    en: "Content filters",
  },
  "contentLevelEditor.loadingContent": {
    pl: "Ładuję treści…",
    en: "Loading content…",
  },
  "contentLevelEditor.no": {
    pl: "Nie",
    en: "No",
  },
  "contentLevelEditor.noCards": {
    pl: "Brak kart — włącz tryb albo poluzuj filtry.",
    en: "No cards — enable a mode or loosen the filters.",
  },
  "contentLevelEditor.poolCountPrefix": {
    pl: "W puli:",
    en: "In pool:",
  },
  "contentLevelEditor.poolCountSuffix": {
    pl: "kart z wybranych treści.",
    en: "cards from selected content.",
  },
  "contentLevelEditor.select": {
    pl: "Wybierz",
    en: "Choose",
  },
  "contentLevelEditor.subcategories": {
    pl: "Podkategorie",
    en: "Subcategories",
  },
  "contentLevelEditor.subcategoriesCount": {
    pl: "podkategorii",
    en: "subcategories",
  },
  "contentLevelEditor.unlock": {
    pl: "Odblokuj",
    en: "Unlock",
  },
  "contentLevelEditor.weAre18": {
    pl: "Mamy 18+",
    en: "We're 18+",
  },
  "contentSummary.change": {
    pl: "Zmień",
    en: "Change",
  },
  "contentSummary.emptyGuest": {
    pl: "Host nie wybrał jeszcze kategorii treści.",
    en: "The host hasn't selected any content categories yet.",
  },
  "contentSummary.emptyHost": {
    pl: "Brak aktywnych kategorii — wybierz w Ustawienia → Treści.",
    en: "No active categories — choose in Settings → Content.",
  },
  "contentSummary.title": {
    pl: "Treści w grze",
    en: "Game content",
  },
  "globalSettingsScreen.backAccessibilityLabel": {
    pl: "Wróć",
    en: "Go back",
  },
  "globalSettingsScreen.contentCategoriesDescription": {
    pl: "Ten dobór zostanie zastosowany automatycznie przy zakładaniu nowego pokoju. W pokoju (Ustawienia → Treści) możesz go w każdej chwili zmienić.",
    en: "This selection will be applied automatically when creating a new room. You can change it at any time in the room (Settings → Content).",
  },
  "globalSettingsScreen.contentCategoriesLabel": {
    pl: "Domyślne kategorie treści",
    en: "Default content categories",
  },
  "globalSettingsScreen.defaultAvatarLabel": {
    pl: "Domyślny avatar",
    en: "Default avatar",
  },
  "globalSettingsScreen.defaultColorLabel": {
    pl: "Domyślny kolor",
    en: "Default color",
  },
  "globalSettingsScreen.defaultNameLabel": {
    pl: "Domyślne imię",
    en: "Default name",
  },
  "globalSettingsScreen.langPolish": {
    pl: "Polski",
    en: "Polish",
  },
  "globalSettingsScreen.languageLabel": {
    pl: "Język / Language",
    en: "Language",
  },
  "globalSettingsScreen.namePlaceholder": {
    pl: "Twoje imię",
    en: "Your name",
  },
  "globalSettingsScreen.profileSubtitle": {
    pl: "Domyślny profil — podstawiany przy tworzeniu pokoju",
    en: "Default profile — applied when creating a room",
  },
  "globalSettingsScreen.tabContent": {
    pl: "Treści",
    en: "Content",
  },
  "globalSettingsScreen.tabProfile": {
    pl: "Profil",
    en: "Profile",
  },
  "globalSettingsScreen.title": {
    pl: "Ustawienia",
    en: "Settings",
  },
  "leaveConfirmDialog.closeAccessibilityLabel": {
    pl: "Zamknij",
    en: "Close",
  },
  "leaveConfirmDialog.description": {
    pl: 'Możesz wrócić do tej sesji z ekranu głównego przyciskiem „Dołącz ponownie".',
    en: 'You can return to this session from the home screen using the "Rejoin" button.',
  },
  "leaveConfirmDialog.leaveButton": {
    pl: "Wyjdź",
    en: "Leave",
  },
  "leaveConfirmDialog.stayButton": {
    pl: "Zostań",
    en: "Stay",
  },
  "leaveConfirmDialog.title": {
    pl: "Wyjść z pokoju?",
    en: "Leave the room?",
  },
  "luckyView.chooseFor": {
    pl: "Wybierz za",
    en: "Choose for",
  },
  "luckyView.chooseForYourself": {
    pl: "Wybierz, co chcesz:",
    en: "Pick your challenge:",
  },
  "luckyView.choosingTruthOrDare": {
    pl: "wybiera prawdę albo wyzwanie…",
    en: "is choosing truth or dare…",
  },
  "luckyView.dare": {
    pl: "Wyzwanie",
    en: "Dare",
  },
  "luckyView.itsPrefix": {
    pl: "To",
    en: "It's",
  },
  "luckyView.itsYou": {
    pl: "To Ty!",
    en: "It's you!",
  },
  "luckyView.luckyOne": {
    pl: "Szczęśliwiec!",
    en: "Lucky one!",
  },
  "luckyView.truth": {
    pl: "Prawda",
    en: "Truth",
  },
  "luckyView.waitForResult": {
    pl: "Za chwilę zobaczysz, co go czeka.",
    en: "You'll see their challenge in a moment.",
  },
  "luckyView.you": {
    pl: "Ty",
    en: "You",
  },
  "onboardingCarousel.close": {
    pl: "Zamknij",
    en: "Close",
  },
  "onboardingCarousel.gotIt": {
    pl: "Rozumiem",
    en: "Got it",
  },
  "onboardingCarousel.next": {
    pl: "Dalej",
    en: "Next",
  },
  "onboardingScreen.createRoom": {
    pl: "Tworzenie pokoju",
    en: "Create Room",
  },
  "onboardingScreen.gameMode": {
    pl: "Tryb gry",
    en: "Game mode",
  },
  "onboardingScreen.joinButton": {
    pl: "Dołącz do pokoju",
    en: "Join room",
  },
  "onboardingScreen.joinRoom": {
    pl: "Dołączanie do pokoju",
    en: "Join Room",
  },
  "onboardingScreen.modeMultiPhone": {
    pl: "Wiele telefonów",
    en: "Multiple phones",
  },
  "onboardingScreen.modeMultiPhoneSub": {
    pl: "Każdy gra na swoim, dołącza kodem",
    en: "Everyone plays on their own device, joins with a code",
  },
  "onboardingScreen.modeSinglePhone": {
    pl: "Jeden telefon",
    en: "One phone",
  },
  "onboardingScreen.modeSinglePhoneSub": {
    pl: "Jedna osoba prowadzi i dodaje graczy",
    en: "One person hosts and adds players",
  },
  "onboardingScreen.namePlaceholder": {
    pl: "Twoje imię",
    en: "Your name",
  },
  "onboardingScreen.privacyNote": {
    pl: "Twoje imię i avatar będą widoczne dla innych graczy w pokoju",
    en: "Your name and avatar will be visible to other players in the room",
  },
  "onboardingScreen.stepAvatar": {
    pl: "2. Wybierz avatar",
    en: "2. Choose an avatar",
  },
  "onboardingScreen.stepColor": {
    pl: "3. Wybierz kolor",
    en: "3. Choose a color",
  },
  "onboardingScreen.stepName": {
    pl: "1. Wpisz swoje imię",
    en: "1. Enter your name",
  },
  "onboardingScreen.welcomeHeading": {
    pl: "Witaj w pokoju!",
    en: "Welcome to the room!",
  },
  "onboardingScreen.welcomeSubheading": {
    pl: "Zanim dołączysz, stwórz swoją postać",
    en: "Before you join, create your character",
  },
  "paywall.maybe_later": {
    pl: "Może później",
    en: "Maybe later",
  },
  "paywall.privacy": {
    pl: "Prywatność",
    en: "Privacy",
  },
  "paywall.pro_all": {
    pl: "PRO — wszystko",
    en: "PRO — everything",
  },
  "paywall.pro_all_price": {
    pl: "PRO — wszystko za",
    en: "PRO — everything for",
  },
  "paywall.restore_purchases": {
    pl: "Przywróć zakupy",
    en: "Restore purchases",
  },
  "paywall.single_price_prefix": {
    pl: "Tylko",
    en: "Just",
  },
  "paywall.unlock_title": {
    pl: "Odblokuj",
    en: "Unlock",
  },
  "playerAvatar.you": {
    pl: "Ty",
    en: "You",
  },
  "playersSheet.addTestPlayer": {
    pl: "Dodaj gracza testowego",
    en: "Add test player",
  },
  "playersSheet.close": {
    pl: "Zamknij",
    en: "Close",
  },
  "playersSheet.kick": {
    pl: "Wyrzuć:",
    en: "Kick",
  },
  "playersSheet.leaveRoom": {
    pl: "Opuść pokój",
    en: "Leave room",
  },
  "playersSheet.tapToViewPerspective": {
    pl: "Dotknij, aby zobaczyć jego widok",
    en: "Tap to see their view",
  },
  "playersSheet.testModeHint": {
    pl: "Dotknij gracza, aby oglądać grę z jego perspektywy (test na jednym urządzeniu).",
    en: "Tap a player to watch the game from their perspective (single-device test).",
  },
  "playersSheet.title": {
    pl: "Gracze",
    en: "Players",
  },
  "playersSheet.viewPerspectiveOf": {
    pl: "Pokaż widok:",
    en: "View perspective of",
  },
  "playersSheet.watchingThisView": {
    pl: "Oglądasz ten widok",
    en: "Watching this view",
  },
  "roomHeader.leaveRoom": {
    pl: "Opuść pokój",
    en: "Leave room",
  },
  "roomHeader.playersInRoom": {
    pl: "Gracze w pokoju",
    en: "Players in room",
  },
  "roomHeader.roomLabel": {
    pl: "Pokój:",
    en: "Room:",
  },
  "roomHeader.roomSettings": {
    pl: "Ustawienia pokoju",
    en: "Room settings",
  },
  "roomScreen.backToSelf": {
    pl: "Wróć do siebie",
    en: "Back to yourself",
  },
  "roomScreen.player": {
    pl: "gracz",
    en: "player",
  },
  "roomScreen.watchingAs": {
    pl: "Oglądasz jako",
    en: "Watching as",
  },
  "roomScreen.you": {
    pl: "Ty",
    en: "You",
  },
  "roundHistory.dare": {
    pl: "Wyzwanie",
    en: "Dare",
  },
  "roundHistory.defaultPlayerName": {
    pl: "Gracz",
    en: "Player",
  },
  "roundHistory.emptyState": {
    pl: "Jeszcze nikt nie zagrał rundy — kolejne tury pojawią się tutaj.",
    en: "No rounds played yet — turns will appear here.",
  },
  "roundHistory.gameProgress": {
    pl: "Przebieg gry",
    en: "Game history",
  },
  "roundHistory.truth": {
    pl: "Prawda",
    en: "Truth",
  },
  "settingsScreen.answerTimeTitle": {
    pl: "Czas na odpowiedź",
    en: "Answer time",
  },
  "settingsScreen.approvalChangeDare": {
    pl: "zmianę wyzwania",
    en: "changing the dare",
  },
  "settingsScreen.approvalChangeQuestion": {
    pl: "zmianę pytania",
    en: "changing the question",
  },
  "settingsScreen.approvalEndTurn": {
    pl: "koniec tury (kolejka gracza)",
    en: "ending a turn (player queue)",
  },
  "settingsScreen.approvalHint": {
    pl: "„Bez zgody” wykonuje akcję od razu. „Połowa / Większość / Wszyscy” wymaga zgody danej części graczy w głosowaniu.",
    en: '"No approval" executes the action immediately. "Half / Majority / Everyone" requires the specified share of players to vote in favour.',
  },
  "settingsScreen.approvalSectionTitle": {
    pl: "Ile osób musi się zgodzić na…",
    en: "How many players must agree to…",
  },
  "settingsScreen.autoStartLabel": {
    pl: "Runda startuje automatycznie (bez losowania przez hosta)",
    en: "Round starts automatically (no host draw required)",
  },
  "settingsScreen.backToRoom": {
    pl: "Wróć do pokoju",
    en: "Back to room",
  },
  "settingsScreen.comingSoon": {
    pl: "Ta sekcja pojawi się wkrótce.",
    en: "This section is coming soon.",
  },
  "settingsScreen.contentSectionHint": {
    pl: "Wybierz główne kategorie i jak mocne treści mają z nich wpadać. Suwak: Wył. → Łagodne → Mocniejsze → Pełne. Możesz włączyć kilka naraz.",
    en: "Choose the main categories and how intense the content should be. Slider: Off → Mild → Stronger → Full. You can enable multiple at once.",
  },
  "settingsScreen.contentSectionTitle": {
    pl: "Z czego losujemy?",
    en: "What are we drawing from?",
  },
  "settingsScreen.dareTimeLabel": {
    pl: "Wyzwanie — czas na wykonanie",
    en: "Dare — time to complete",
  },
  "settingsScreen.roundStartTitle": {
    pl: "Start rundy",
    en: "Round start",
  },
  "settingsScreen.tabContent": {
    pl: "Treści",
    en: "Content",
  },
  "settingsScreen.tabGameplay": {
    pl: "Rozgrywka",
    en: "Gameplay",
  },
  "settingsScreen.tabSounds": {
    pl: "Dźwięki",
    en: "Sounds",
  },
  "settingsScreen.thresholdAll": {
    pl: "Wszyscy",
    en: "Everyone",
  },
  "settingsScreen.thresholdHalf": {
    pl: "Połowa",
    en: "Half",
  },
  "settingsScreen.thresholdMajority": {
    pl: "Większość",
    en: "Majority",
  },
  "settingsScreen.thresholdOff": {
    pl: "Bez zgody",
    en: "No approval",
  },
  "settingsScreen.timerHint": {
    pl: "„Wył.” chowa licznik. W rundzie odliczanie pojawia się między kartą a przyciskami.",
    en: '"Off" hides the timer. During a round the countdown appears between the card and the buttons.',
  },
  "settingsScreen.timerOff": {
    pl: "Wył.",
    en: "Off",
  },
  "settingsScreen.title": {
    pl: "Ustawienia pokoju",
    en: "Room settings",
  },
  "settingsScreen.truthTimeLabel": {
    pl: "Prawda — czas na odpowiedź",
    en: "Truth — time to answer",
  },
  "startScreen.aboutSlide1Body": {
    pl: "Pokojowa gra w prawdę albo wyzwanie — neonowa, szybka i robiona dla znajomych.",
    en: "A party truth-or-dare game — neon, fast, and made for friends.",
  },
  "startScreen.aboutSlide1Title": {
    pl: "Butelka",
    en: "Butelka",
  },
  "startScreen.aboutSlide2Body": {
    pl: "Stwórz pokój, podaj znajomym jego ID i bawcie się na jednym lub wielu telefonach.",
    en: "Create a room, share the ID with your friends, and play on one or multiple phones.",
  },
  "startScreen.aboutSlide2Title": {
    pl: "Grajcie razem",
    en: "Play together",
  },
  "startScreen.activeSessionRoom": {
    pl: "Pokój",
    en: "Room",
  },
  "startScreen.activeSessionTitle": {
    pl: "Masz aktywną sesję",
    en: "Active session",
  },
  "startScreen.createRoomA11y": {
    pl: "Utwórz pokój",
    en: "Create room",
  },
  "startScreen.createRoomSubtitle": {
    pl: "Stwórz pokój i zaproś znajomych",
    en: "Create a room and invite your friends",
  },
  "startScreen.createRoomTitle": {
    pl: "Utwórz pokój",
    en: "Create room",
  },
  "startScreen.dismissSessionA11y": {
    pl: "Odrzuć sesję",
    en: "Dismiss session",
  },
  "startScreen.footerAbout": {
    pl: "O grze",
    en: "About",
  },
  "startScreen.footerCategories": {
    pl: "Kategorie",
    en: "Categories",
  },
  "startScreen.footerRules": {
    pl: "Zasady",
    en: "Rules",
  },
  "startScreen.footerSettings": {
    pl: "Ustawienia",
    en: "Settings",
  },
  "startScreen.joinButton": {
    pl: "Dołącz",
    en: "Join",
  },
  "startScreen.joinRoomSubtitle": {
    pl: "Wpisz ID pokoju, aby dołączyć",
    en: "Enter the room ID to join",
  },
  "startScreen.joinRoomTitle": {
    pl: "Dołącz do pokoju",
    en: "Join a room",
  },
  "startScreen.rejoinButton": {
    pl: "Dołącz ponownie",
    en: "Rejoin",
  },
  "startScreen.rulesSlide1Body": {
    pl: "Karta „Ty” krąży wśród wszystkich graczy w pokoju — losowo, w rytm animacji.",
    en: 'The "You" card travels among all players in the room — randomly, in time with the animation.',
  },
  "startScreen.rulesSlide1Title": {
    pl: "Karta krąży",
    en: "The card travels",
  },
  "startScreen.rulesSlide2Body": {
    pl: "Kogo wskaże los, ten zostaje szczęśliwcem rundy. Jego karta wyrasta na środku ekranu.",
    en: "Whoever luck picks becomes the round's chosen one. Their card rises to the center of the screen.",
  },
  "startScreen.rulesSlide2Title": {
    pl: "Los wskazuje szczęśliwca",
    en: "Luck picks the chosen one",
  },
  "startScreen.rulesSlide3Body": {
    pl: "Szczęśliwiec wybiera: prawdę albo wyzwanie. Po wykonaniu zadania tura przechodzi dalej.",
    en: "The chosen one picks truth or dare. Once done, the turn passes to the next player.",
  },
  "startScreen.rulesSlide3Title": {
    pl: "Prawda albo wyzwanie",
    en: "Truth or dare",
  },
  "subcategorySheet.accept": {
    pl: "Akceptuję",
    en: "I accept",
  },
  "subcategorySheet.cancel": {
    pl: "Anuluj",
    en: "Cancel",
  },
  "subcategorySheet.close": {
    pl: "Zamknij",
    en: "Close",
  },
  "subcategorySheet.loading": {
    pl: "Ładuję podkategorie…",
    en: "Loading subcategories…",
  },
  "subcategorySheet.subtitle": {
    pl: "Wybierz podkategorie do losowania",
    en: "Select subcategories to draw from",
  },
};

/** Tekst interfejsu wg bieżącego języka. Brak klucza -> zwraca klucz (widoczny sygnał braku). */
export function t(key: string): string {
  const e = UI[key];
  if (!e) return key;
  return getLang() === "en" ? e.en || e.pl : e.pl;
}

/** Scala wpisy słownika (używane przy budowaniu UI z wielu modułów). */
export function registerUI(entries: Record<string, Entry>): void {
  Object.assign(UI, entries);
}
