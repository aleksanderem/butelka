import type { AnimationObject } from "lottie-react-native";

import cloud from "@/assets/avatars/cloud.json";
import folder from "@/assets/avatars/folder.json";
import gear from "@/assets/avatars/gear.json";
import heart from "@/assets/avatars/heart.json";
import mail from "@/assets/avatars/mail.json";
import message from "@/assets/avatars/message.json";
import money from "@/assets/avatars/money.json";
import paper from "@/assets/avatars/paper.json";
import pencil from "@/assets/avatars/pencil.json";
import phone from "@/assets/avatars/phone.json";
import planet from "@/assets/avatars/planet.json";
import search from "@/assets/avatars/search.json";
import shield from "@/assets/avatars/shield.json";
import star from "@/assets/avatars/star.json";
import wallet from "@/assets/avatars/wallet.json";
import type { AvatarId } from "@/game/types";

/** Źródła animacji Lottie dla każdej maskotki-avatara. */
export const avatarSources: Record<AvatarId, AnimationObject> = {
  star: star as AnimationObject,
  heart: heart as AnimationObject,
  planet: planet as AnimationObject,
  money: money as AnimationObject,
  gear: gear as AnimationObject,
  cloud: cloud as AnimationObject,
  wallet: wallet as AnimationObject,
  shield: shield as AnimationObject,
  mail: mail as AnimationObject,
  message: message as AnimationObject,
  phone: phone as AnimationObject,
  search: search as AnimationObject,
  paper: paper as AnimationObject,
  pencil: pencil as AnimationObject,
  folder: folder as AnimationObject,
};

/** Kolejność avatarów w siatce wyboru (pierwszy = domyślny). */
export const avatarOrder: AvatarId[] = [
  "star",
  "heart",
  "planet",
  "money",
  "gear",
  "cloud",
  "wallet",
  "shield",
  "mail",
  "message",
  "phone",
  "search",
  "paper",
  "pencil",
  "folder",
];
