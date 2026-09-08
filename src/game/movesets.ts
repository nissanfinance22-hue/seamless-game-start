// Elementos (tipos) e movesets canônicos do Ruby M.
// Ataques são liberados a cada 3 níveis: slot 0 lv1, slot 1 lv3, slot 2 lv6, slot 3 lv9.

import type { Species } from "./systems";

export type PokeType =
  | "Normal" | "Fogo" | "Agua" | "Planta" | "Eletrico" | "Gelo"
  | "Lutador" | "Veneno" | "Terra" | "Voador" | "Psiquico"
  | "Inseto" | "Pedra" | "Fantasma" | "Dragao" | "Sombrio" | "Aco" | "Fada";

export const TYPE_COLOR: Record<PokeType, string> = {
  Normal: "#a8a878", Fogo: "#f08030", Agua: "#6890f0", Planta: "#78c850",
  Eletrico: "#f8d030", Gelo: "#98d8d8", Lutador: "#c03028", Veneno: "#a040a0",
  Terra: "#e0c068", Voador: "#a890f0", Psiquico: "#f85888", Inseto: "#a8b820",
  Pedra: "#b8a038", Fantasma: "#705898", Dragao: "#7038f8", Sombrio: "#705848",
  Aco: "#b8b8d0", Fada: "#ee99ac",
};

export const TYPE_ICON: Record<PokeType, string> = {
  Normal: "⭐", Fogo: "🔥", Agua: "💧", Planta: "🌿", Eletrico: "⚡",
  Gelo: "❄️", Lutador: "🥊", Veneno: "☠️", Terra: "🌎", Voador: "🕊️",
  Psiquico: "🔮", Inseto: "🐛", Pedra: "🪨", Fantasma: "👻", Dragao: "🐉",
  Sombrio: "🌑", Aco: "⚙️", Fada: "✨",
};

export interface MoveDef {
  name: string;
  icon: string;
  power: "Baixo" | "Médio" | "Alto" | "Muito Alto" | "Extremo" | "Suporte";
  desc: string;
}

export interface SpeciesDex {
  types: PokeType[];
  moves: [MoveDef, MoveDef, MoveDef, MoveDef];
}

const m = (name: string, icon: string, power: MoveDef["power"], desc: string): MoveDef => ({ name, icon, power, desc });

// Tabela canônica. Espécies não listadas caem no fallback default.
export const DEX: Partial<Record<Species, SpeciesDex>> = {
  abra:        { types: ["Psiquico"], moves: [m("Confusion","🧠","Médio","Pode confundir"), m("Psybeam","💫","Alto","Pode confundir"), m("Recover","✨","Suporte","Recupera HP"), m("Psychic","🌟","Muito Alto","Pode reduzir Sp.Def")] },
  kadabra:     { types: ["Psiquico"], moves: [m("Confusion","🧠","Médio","Pode confundir"), m("Psybeam","💫","Alto","Pode confundir"), m("Recover","✨","Suporte","Cura HP"), m("Psychic","🔮","Muito Alto","Pode reduzir Sp.Def")] },
  arcanine:    { types: ["Fogo"], moves: [m("Flamethrower","🔥","Alto","Chance de queimar"), m("Fire Blast","🔥","Extremo","Alta chance de queimar"), m("Extreme Speed","⚡","Médio","Sempre ataca primeiro"), m("Crunch","🦷","Alto","Pode reduzir defesa")] },
  growlithe:   { types: ["Fogo"], moves: [m("Ember","🔥","Baixo","Pode queimar"), m("Flamethrower","🔥","Alto","Chance de queimar"), m("Bite","🦷","Médio","Pode causar medo"), m("Extreme Speed","⚡","Médio","Prioridade alta")] },
  beedrill:    { types: ["Inseto","Veneno"], moves: [m("Twinneedle","🐝","Médio","Chance de veneno"), m("Poison Jab","☠️","Alto","Chance de veneno"), m("Fury Attack","⚔️","Médio","Multi-hit"), m("X-Scissor","🪲","Alto","Corte cruzado")] },
  bellsprout:  { types: ["Planta","Veneno"], moves: [m("Vine Whip","🍃","Médio","Chicote vegetal"), m("Razor Leaf","🌿","Alto","Crítico elevado"), m("Sleep Powder","😴","Suporte","Coloca para dormir"), m("Solar Beam","☀️","Extremo","Ataque carregado")] },
  gloom:       { types: ["Planta","Veneno"], moves: [m("Absorb","🌿","Baixo","Rouba HP"), m("Razor Leaf","🍃","Alto","Crítico elevado"), m("Sleep Powder","😴","Suporte","Sono"), m("Solar Beam","☀️","Extremo","Carregado")] },
  vileplume:   { types: ["Planta","Veneno"], moves: [m("Giga Drain","🌿","Alto","Rouba HP"), m("Sleep Powder","😴","Suporte","Sono"), m("Solar Beam","☀️","Extremo","Carregado"), m("Sludge Bomb","☠️","Alto","Chance de veneno")] },
  oddish:      { types: ["Planta","Veneno"], moves: [m("Absorb","🌿","Baixo","Rouba HP"), m("Razor Leaf","🍃","Médio","Crítico elevado"), m("Sleep Powder","😴","Suporte","Sono"), m("Solar Beam","☀️","Extremo","Carregado")] },
  blastoise:        { types: ["Agua"], moves: [m("Hydro Pump","🌊","Extremo","Jato d'água"), m("Surf","🏄","Alto","Onda gigante"), m("Ice Beam","❄️","Alto","Chance congelar"), m("Skull Bash","💥","Muito Alto","Cabeçada brutal")] },
  blastoise_shiny:  { types: ["Agua"], moves: [m("Hydro Pump","🌊","Extremo","Variante Shiny"), m("Surf","🏄","Alto","Onda alta"), m("Ice Beam","❄️","Alto","Chance congelar"), m("Skull Bash","💥","Muito Alto","Investida")] },
  butterfree:       { types: ["Inseto","Voador"], moves: [m("Confusion","🧠","Médio","Pode confundir"), m("Sleep Powder","😴","Suporte","Sono"), m("Gust","🌪️","Médio","Rajada"), m("Psychic","🔮","Muito Alto","Onda psíquica")] },
  butterfree_shiny: { types: ["Inseto","Voador"], moves: [m("Silver Wind","🦋","Alto","Pode aumentar status"), m("Sleep Powder","😴","Suporte","Sono"), m("Bug Buzz","🪲","Muito Alto","Pode reduzir Sp.Def"), m("Psychic","🔮","Muito Alto","Onda psíquica")] },
  caterpie:    { types: ["Inseto"], moves: [m("Tackle","💥","Baixo","Investida"), m("String Shot","🕸️","Suporte","Reduz velocidade"), m("Bug Bite","🪲","Médio","Mordida inseto"), m("Headbutt","⚔️","Médio","Pode assustar")] },
  charmeleon:  { types: ["Fogo"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Slash","⚔️","Médio","Crítico elevado"), m("Fire Fang","🔥","Médio","Pode queimar"), m("Fire Spin","🌪️","Alto","Dano contínuo")] },
  charmander:  { types: ["Fogo"], moves: [m("Ember","🔥","Baixo","Pode queimar"), m("Flamethrower","🔥","Alto","Lança chamas"), m("Slash","⚔️","Médio","Crítico elevado"), m("Fire Spin","🌪️","Alto","Aprisiona")] },
  charizard:   { types: ["Fogo","Voador"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Wing Attack","🪽","Médio","Asas afiadas"), m("Fire Blast","🔥","Extremo","Bola de fogo"), m("Dragon Claw","🐉","Muito Alto","Garras dracônicas")] },
  charizard_shiny: { types: ["Fogo","Voador"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Wing Attack","🪽","Médio","Asas afiadas"), m("Fire Blast","🔥","Extremo","Bola de fogo"), m("Dragon Claw","🐉","Muito Alto","Garras dracônicas")] },
  charizard_alt:   { types: ["Fogo","Voador"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Wing Attack","🪽","Médio","Asas afiadas"), m("Fire Blast","🔥","Extremo","Bola de fogo"), m("Dragon Claw","🐉","Muito Alto","Garras dracônicas")] },
  clefable:    { types: ["Fada"], moves: [m("Moonblast","⭐","Muito Alto","Energia da lua"), m("Sing","💋","Suporte","Sono"), m("Meteor Mash","🌠","Alto","Pode aumentar ataque"), m("Cosmic Power","✨","Suporte","Aumenta defesas")] },
  clefairy:    { types: ["Fada"], moves: [m("Sing","💋","Suporte","Sono"), m("Moonblast","⭐","Alto","Energia da lua"), m("Charm","💖","Suporte","Reduz ataque"), m("Metronome","✨","Médio","Golpe aleatório")] },
  cubone:      { types: ["Terra"], moves: [m("Bone Club","🦴","Alto","Marra com osso"), m("Earthquake","🌎","Extremo","Tremor"), m("Headbutt","⚔️","Médio","Pode stunar"), m("Double Edge","💥","Muito Alto","Recuo")] },
  diglett:     { types: ["Terra"], moves: [m("Dig","🏃","Médio","Toca subterrânea"), m("Earthquake","🌎","Alto","Tremor"), m("Rock Slide","🪨","Alto","Pode stunar"), m("Slash","⚔️","Médio","Crítico elevado")] },
  ekans:       { types: ["Veneno"], moves: [m("Poison Sting","☠️","Baixo","Chance de veneno"), m("Bite","🦷","Médio","Pode causar medo"), m("Acid","🧪","Médio","Spray ácido"), m("Glare","👁️","Suporte","Paralisa")] },
  fearow:      { types: ["Normal","Voador"], moves: [m("Drill Peck","🪶","Alto","Bicada brutal"), m("Fury Attack","⚔️","Médio","Multi-hit"), m("Aerial Ace","🌪️","Alto","Nunca erra"), m("Agility","🏃","Suporte","Aumenta velocidade")] },
  golem:       { types: ["Pedra","Terra"], moves: [m("Earthquake","🌎","Extremo","Tremor"), m("Rock Slide","🪨","Alto","Avalanche"), m("Explosion","💥","Extremo","Auto destruição"), m("Rollout","⚡","Médio","Dano crescente")] },
  kakuna:      { types: ["Inseto","Veneno"], moves: [m("Harden","🛡️","Suporte","Aumenta defesa"), m("Poison Sting","☠️","Baixo","Chance veneno"), m("Bug Bite","🪲","Baixo","Mordida"), m("Tackle","⚔️","Baixo","Investida")] },
  kakuna_shiny:{ types: ["Inseto","Veneno"], moves: [m("Harden","🛡️","Suporte","Aumenta defesa"), m("Poison Sting","☠️","Baixo","Chance veneno"), m("Bug Bite","🪲","Baixo","Mordida"), m("Tackle","⚔️","Baixo","Investida")] },
  machamp:     { types: ["Lutador"], moves: [m("Cross Chop","👊","Muito Alto","Golpe duplo"), m("Dynamic Punch","🥊","Alto","Confunde"), m("Submission","💥","Alto","Recuo"), m("Rock Slide","🪨","Médio","Avalanche")] },
  machoke:     { types: ["Lutador"], moves: [m("Karate Chop","👊","Médio","Crítico elevado"), m("Submission","🥊","Alto","Recuo"), m("Seismic Toss","💥","Alto","Baseado no nível"), m("Rock Slide","🪨","Médio","Avalanche")] },
  machop:      { types: ["Lutador"], moves: [m("Low Kick","👊","Médio","+ dano em pesados"), m("Karate Chop","🥊","Médio","Crítico elevado"), m("Seismic Toss","💥","Médio","Baseado no nível"), m("Focus Energy","⚔️","Suporte","Aumenta crítico")] },
  magnemite:   { types: ["Eletrico","Aco"], moves: [m("Thunder Shock","⚡","Baixo","Pode paralisar"), m("Thunderbolt","⚡","Alto","Raio"), m("Magnet Bomb","🧲","Médio","Nunca erra"), m("Flash Cannon","✨","Alto","Raio de aço")] },
  mankey:      { types: ["Lutador"], moves: [m("Low Kick","👊","Médio","Dano variável"), m("Karate Chop","🥊","Médio","Crítico elevado"), m("Rage","💥","Médio","Mais forte ao apanhar"), m("Focus Energy","⚡","Suporte","Aumenta crítico")] },
  meowth:      { types: ["Normal"], moves: [m("Pay Day","🪙","Médio","Gera moedas"), m("Bite","🦷","Médio","Pode causar medo"), m("Fury Swipes","⚡","Médio","Multi-hit"), m("Quick Attack","🏃","Médio","Prioridade alta")] },
  metapod:     { types: ["Inseto"], moves: [m("Harden","🛡️","Suporte","Aumenta defesa"), m("Tackle","⚔️","Baixo","Investida"), m("Bug Bite","🪲","Baixo","Mordida"), m("Headbutt","💥","Médio","Pode stunar")] },
  metapod_shiny: { types: ["Inseto"], moves: [m("Harden","🛡️","Suporte","Aumenta defesa"), m("Tackle","⚔️","Baixo","Investida"), m("Bug Bite","🪲","Baixo","Mordida"), m("Headbutt","💥","Médio","Pode stunar")] },
  nidoking:    { types: ["Veneno","Terra"], moves: [m("Earthquake","🌎","Extremo","Tremor"), m("Poison Jab","☠️","Alto","Chance veneno"), m("Rock Slide","🪨","Alto","Avalanche"), m("Megahorn","👊","Muito Alto","Chifrada brutal")] },
  nidoran_f:   { types: ["Veneno"], moves: [m("Poison Sting","☠️","Baixo","Chance veneno"), m("Scratch","⚔️","Baixo","Arranhão"), m("Bite","🦷","Médio","Pode causar medo"), m("Double Kick","💥","Médio","Multi-hit")] },
  nidorina:    { types: ["Veneno"], moves: [m("Poison Fang","☠️","Médio","Chance veneno"), m("Bite","🦷","Médio","Mordida"), m("Double Kick","💥","Médio","Multi-hit"), m("Fury Swipes","⚔️","Médio","Multi-hit")] },
  ninetales:   { types: ["Fogo"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Fire Blast","🔥","Extremo","Bola de fogo"), m("Confuse Ray","💫","Suporte","Confunde"), m("Will-O-Wisp","🔥","Suporte","Queimadura")] },
  paras:       { types: ["Inseto","Planta"], moves: [m("Bug Bite","🪲","Médio","Mordida"), m("Absorb","🌿","Baixo","Rouba HP"), m("Spore","😴","Suporte","Sono garantido"), m("Slash","✂️","Médio","Crítico elevado")] },
  parasect:    { types: ["Inseto","Planta"], moves: [m("X-Scissor","🪲","Alto","Corte cruzado"), m("Spore","😴","Suporte","Sono garantido"), m("Giga Drain","🌿","Alto","Rouba HP"), m("Slash","✂️","Alto","Corte")] },
  persian:     { types: ["Normal"], moves: [m("Slash","⚔️","Médio","Crítico elevado"), m("Bite","🦷","Médio","Pode causar medo"), m("Quick Attack","🏃","Médio","Prioridade alta"), m("Night Slash","🌑","Alto","Crítico elevado")] },
  pidgeot:     { types: ["Normal","Voador"], moves: [m("Air Slash","🌪️","Alto","Lâmina de ar"), m("Hurricane","🌀","Muito Alto","Furacão"), m("Quick Attack","⚡","Médio","Prioridade"), m("Brave Bird","🦅","Extremo","Investida aérea")] },
  pidgeotto:   { types: ["Normal","Voador"], moves: [m("Wing Attack","🌪️","Médio","Asas"), m("Quick Attack","⚡","Médio","Prioridade"), m("Feather Dance","🪶","Suporte","Reduz ataque"), m("Air Slash","🌪️","Alto","Lâmina de ar")] },
  pidgey:      { types: ["Normal","Voador"], moves: [m("Gust","🌪️","Baixo","Rajada"), m("Quick Attack","⚡","Médio","Prioridade"), m("Sand Attack","🪶","Suporte","Reduz precisão"), m("Wing Attack","🪽","Médio","Asas")] },
  pikachu:     { types: ["Eletrico"], moves: [m("Thunder Shock","⚡","Baixo","Pode paralisar"), m("Thunderbolt","⚡","Alto","Raio"), m("Quick Attack","🏃","Médio","Prioridade"), m("Thunder","⚡","Extremo","Trovão massivo")] },
  poliwag:     { types: ["Agua"], moves: [m("Water Gun","💦","Médio","Jato"), m("Bubble Beam","🌀","Médio","Reduz velocidade"), m("Hypnosis","😵","Suporte","Sono"), m("Hydro Pump","🌊","Muito Alto","Jato d'água")] },
  poliwhirl:   { types: ["Agua"], moves: [m("Water Gun","💦","Médio","Jato"), m("Hypnosis","😵","Suporte","Sono"), m("Body Slam","👊","Alto","Pode paralisar"), m("Hydro Pump","🌊","Muito Alto","Jato d'água")] },
  poliwrath:   { types: ["Agua","Lutador"], moves: [m("Dynamic Punch","👊","Muito Alto","Confunde"), m("Hydro Pump","🌊","Muito Alto","Jato d'água"), m("Submission","🥊","Alto","Recuo"), m("Ice Punch","❄️","Alto","Pode congelar")] },
  primeape:    { types: ["Lutador"], moves: [m("Cross Chop","👊","Muito Alto","Golpe duplo"), m("Close Combat","🥊","Extremo","Reduz defesas"), m("Rage","💥","Médio","Mais forte ao apanhar"), m("Rock Slide","🪨","Alto","Avalanche")] },
  psyduck:     { types: ["Agua"], moves: [m("Water Gun","💦","Médio","Jato"), m("Confusion","🧠","Médio","Pode confundir"), m("Surf","🌊","Alto","Onda"), m("Psychic","🔮","Muito Alto","Onda psíquica")] },
  raichu:      { types: ["Eletrico"], moves: [m("Thunderbolt","⚡","Alto","Raio"), m("Thunder","⚡","Extremo","Trovão"), m("Quick Attack","🏃","Médio","Prioridade"), m("Volt Tackle","⚡","Muito Alto","Investida elétrica")] },
  raticate_f:  { types: ["Normal"], moves: [m("Hyper Fang","🦷","Alto","Presa hipertrofiada"), m("Super Fang","🦷","Alto","Tira muito HP"), m("Crunch","🌑","Médio","Reduz defesa"), m("Quick Attack","⚡","Médio","Prioridade")] },
  rattata_f:   { types: ["Normal"], moves: [m("Quick Attack","⚡","Baixo","Prioridade"), m("Bite","🦷","Médio","Pode causar medo"), m("Hyper Fang","🦷","Alto","Presa forte"), m("Pursuit","💥","Médio","Persegue")] },
  sandshrew:   { types: ["Terra"], moves: [m("Dig","🌎","Médio","Subterrâneo"), m("Rock Tomb","🪨","Médio","Reduz velocidade"), m("Slash","⚔️","Médio","Crítico elevado"), m("Earthquake","🌎","Extremo","Tremor")] },
  sandshrew_shiny: { types: ["Terra"], moves: [m("Dig","🌎","Médio","Subterrâneo"), m("Rock Tomb","🪨","Médio","Reduz velocidade"), m("Slash","⚔️","Médio","Crítico elevado"), m("Earthquake","🌎","Extremo","Tremor")] },
  sandslash:   { types: ["Terra"], moves: [m("Earthquake","🌎","Extremo","Tremor"), m("Slash","⚔️","Alto","Crítico elevado"), m("Rock Slide","🪨","Alto","Avalanche"), m("Defense Curl","🛡️","Suporte","Aumenta defesa")] },
  sandslash_shiny: { types: ["Terra"], moves: [m("Earthquake","🌎","Extremo","Tremor"), m("Slash","⚔️","Alto","Crítico elevado"), m("Rock Slide","🪨","Alto","Avalanche"), m("Defense Curl","🛡️","Suporte","Aumenta defesa")] },
  snorlax:     { types: ["Normal"], moves: [m("Body Slam","💥","Alto","Pode paralisar"), m("Rest","😴","Suporte","Cura total"), m("Hyper Beam","⚔️","Extremo","Raio devastador"), m("Heavy Slam","👊","Muito Alto","Esmagada")] },
  venonat:     { types: ["Inseto","Veneno"], moves: [m("Bug Bite","🪲","Médio","Mordida"), m("Sleep Powder","😴","Suporte","Sono"), m("Psybeam","💫","Alto","Pode confundir"), m("Poison Fang","☠️","Médio","Chance veneno")] },
  venomoth:    { types: ["Inseto","Veneno"], moves: [m("Silver Wind","🦋","Alto","Pode aumentar status"), m("Sleep Powder","😴","Suporte","Sono"), m("Psychic","🔮","Muito Alto","Onda psíquica"), m("Bug Buzz","🪲","Muito Alto","Pode reduzir Sp.Def")] },
  vulpix:      { types: ["Fogo"], moves: [m("Ember","🔥","Baixo","Pode queimar"), m("Flamethrower","🔥","Alto","Lança chamas"), m("Confuse Ray","💫","Suporte","Confunde"), m("Fire Blast","🔥","Extremo","Bola de fogo")] },
  wartortle:   { types: ["Agua"], moves: [m("Water Gun","💦","Médio","Jato"), m("Bite","🦷","Médio","Pode causar medo"), m("Ice Beam","❄️","Alto","Pode congelar"), m("Hydro Pump","🌊","Muito Alto","Jato d'água")] },
  wartortle_shiny: { types: ["Agua"], moves: [m("Water Gun","💦","Médio","Jato"), m("Bite","🦷","Médio","Pode causar medo"), m("Ice Beam","❄️","Alto","Pode congelar"), m("Hydro Pump","🌊","Muito Alto","Jato d'água")] },
  weedle:      { types: ["Inseto","Veneno"], moves: [m("Poison Sting","☠️","Baixo","Chance veneno"), m("String Shot","🕸️","Suporte","Reduz velocidade"), m("Bug Bite","🪲","Baixo","Mordida"), m("Tackle","⚔️","Baixo","Investida")] },
  weedle_shiny:{ types: ["Inseto","Veneno"], moves: [m("Poison Sting","☠️","Baixo","Chance veneno"), m("String Shot","🕸️","Suporte","Reduz velocidade"), m("Bug Bite","🪲","Baixo","Mordida"), m("Tackle","⚔️","Baixo","Investida")] },
  zubat:       { types: ["Veneno","Voador"], moves: [m("Bite","🦷","Médio","Pode causar medo"), m("Wing Attack","🌪️","Médio","Asas"), m("Poison Fang","☠️","Médio","Chance veneno"), m("Air Cutter","🌪️","Alto","Crítico elevado")] },
  bulbasaur:   { types: ["Planta","Veneno"], moves: [m("Vine Whip","🍃","Médio","Chicote vegetal"), m("Razor Leaf","🌿","Médio","Crítico elevado"), m("Sleep Powder","😴","Suporte","Sono"), m("Solar Beam","☀️","Extremo","Carregado")] },
  ivysaur:     { types: ["Planta","Veneno"], moves: [m("Razor Leaf","🍃","Alto","Crítico elevado"), m("Giga Drain","🌿","Alto","Rouba HP"), m("Sleep Powder","😴","Suporte","Sono"), m("Solar Beam","☀️","Extremo","Carregado")] },
  venusaur:    { types: ["Planta","Veneno"], moves: [m("Solar Beam","☀️","Extremo","Carregado"), m("Giga Drain","🌿","Alto","Rouba HP"), m("Sleep Powder","😴","Suporte","Sono"), m("Petal Dance","🌺","Muito Alto","Pode confundir")] },
  squirtle:    { types: ["Agua"], moves: [m("Bubble","🫧","Baixo","Reduz velocidade"), m("Water Gun","💦","Médio","Jato"), m("Bite","🦷","Médio","Pode causar medo"), m("Hydro Pump","🌊","Muito Alto","Jato d'água")] },
  jigglypuff:  { types: ["Normal","Fada"], moves: [m("Sing","🎵","Suporte","Coloca para dormir"), m("Body Slam","💥","Alto","Chance de paralisia"), m("Charm","💖","Suporte","Reduz ataque"), m("Moonblast","⭐","Muito Alto","Energia da lua")] },
  onix:        { types: ["Pedra","Terra"], moves: [m("Rock Throw","🪨","Médio","Pedrada"), m("Earthquake","🌎","Extremo","Tremor"), m("Rock Slide","🪨","Alto","Chance de stun"), m("Iron Tail","💥","Alto","Cauda de aço")] },
  arbok:       { types: ["Veneno"], moves: [m("Poison Fang","☠️","Médio","Chance veneno"), m("Crunch","🦷","Alto","Mordida"), m("Acid Spray","🧪","Médio","Reduz Sp.Def"), m("Glare","👁️","Suporte","Paralisa")] },
  pinsir:      { types: ["Inseto"], moves: [m("X-Scissor","✂️","Muito Alto","Corte cruzado"), m("Vice Grip","🦏","Alto","Esmaga"), m("Submission","💥","Alto","Recuo"), m("Superpower","👊","Extremo","Reduz status")] },
  magmar:      { types: ["Fogo"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Fire Blast","🔥","Extremo","Bola de fogo"), m("Fire Punch","👊","Médio","Pode queimar"), m("Lava Plume","🌋","Alto","Erupção")] },
  hitmonchan:  { types: ["Lutador"], moves: [m("Thunder Punch","👊","Médio","Pode paralisar"), m("Ice Punch","❄️","Médio","Pode congelar"), m("Fire Punch","🔥","Médio","Pode queimar"), m("Close Combat","🥊","Extremo","Reduz defesas")] },
  aerodactyl:  { types: ["Pedra","Voador"], moves: [m("Rock Slide","🪨","Alto","Avalanche"), m("Wing Attack","🦅","Alto","Asas"), m("Crunch","🦷","Alto","Mordida"), m("Ancient Power","🦖","Alto","Pode aumentar status")] },
  tangela:     { types: ["Planta"], moves: [m("Vine Whip","🌿","Médio","Chicote"), m("Giga Drain","🌿","Alto","Rouba HP"), m("Sleep Powder","😴","Suporte","Sono"), m("Solar Beam","☀️","Extremo","Carregado")] },
  vaporeon:    { types: ["Agua"], moves: [m("Hydro Pump","🌊","Muito Alto","Jato d'água"), m("Surf","🏄","Alto","Onda"), m("Ice Beam","❄️","Alto","Pode congelar"), m("Aqua Tail","💧","Alto","Cauda d'água")] },
  vaporeon_shiny: { types: ["Agua"], moves: [m("Hydro Pump","🌊","Muito Alto","Jato d'água"), m("Surf","🏄","Alto","Onda"), m("Ice Beam","❄️","Alto","Pode congelar"), m("Aqua Tail","💧","Alto","Cauda d'água")] },
  jolteon:     { types: ["Eletrico"], moves: [m("Thunderbolt","⚡","Alto","Raio"), m("Thunder","⚡","Extremo","Trovão"), m("Pin Missile","⚡","Médio","Multi-hit"), m("Agility","🏃","Suporte","+ velocidade")] },
  jolteon_shiny: { types: ["Eletrico"], moves: [m("Thunderbolt","⚡","Alto","Raio"), m("Thunder","⚡","Extremo","Trovão"), m("Pin Missile","⚡","Médio","Multi-hit"), m("Agility","🏃","Suporte","+ velocidade")] },
  flareon:     { types: ["Fogo"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Fire Blast","🔥","Extremo","Bola de fogo"), m("Fire Fang","🔥","Médio","Pode queimar"), m("Superpower","💥","Muito Alto","Reduz status")] },
  flareon_shiny: { types: ["Fogo"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Fire Blast","🔥","Extremo","Bola de fogo"), m("Fire Fang","🔥","Médio","Pode queimar"), m("Superpower","💥","Muito Alto","Reduz status")] },
  lapras:      { types: ["Agua","Gelo"], moves: [m("Hydro Pump","🌊","Muito Alto","Jato d'água"), m("Ice Beam","❄️","Alto","Pode congelar"), m("Surf","🏄","Alto","Onda"), m("Sing","🎵","Suporte","Sono")] },
  gyarados:    { types: ["Agua","Voador"], moves: [m("Hydro Pump","🌊","Muito Alto","Jato d'água"), m("Crunch","🦷","Alto","Mordida"), m("Dragon Rage","🐉","Médio","Dano fixo"), m("Hurricane","🌪️","Muito Alto","Furacão")] },
  dragonair:   { types: ["Dragao"], moves: [m("Dragon Breath","🐉","Médio","Pode paralisar"), m("Aqua Tail","🌊","Alto","Cauda d'água"), m("Thunder Wave","⚡","Suporte","Paralisa"), m("Dragon Pulse","🐉","Muito Alto","Pulso dracônico")] },
  dragonite:   { types: ["Dragao","Voador"], moves: [m("Dragon Claw","🐉","Muito Alto","Garras"), m("Hurricane","🌪️","Muito Alto","Furacão"), m("Fire Punch","🔥","Médio","Pode queimar"), m("Thunder Punch","⚡","Médio","Pode paralisar")] },
  dragonite_shiny: { types: ["Dragao","Voador"], moves: [m("Dragon Claw","🐉","Muito Alto","Garras"), m("Hurricane","🌪️","Muito Alto","Furacão"), m("Fire Punch","🔥","Médio","Pode queimar"), m("Thunder Punch","⚡","Médio","Pode paralisar")] },
  articuno:    { types: ["Gelo","Voador"], moves: [m("Ice Beam","❄️","Alto","Pode congelar"), m("Blizzard","❄️","Extremo","Tempestade de gelo"), m("Hurricane","🌪️","Muito Alto","Furacão"), m("Ancient Power","✨","Alto","Pode aumentar status")] },
  zapdos:      { types: ["Eletrico","Voador"], moves: [m("Thunderbolt","⚡","Alto","Raio"), m("Thunder","⚡","Extremo","Trovão"), m("Drill Peck","🌪️","Alto","Bicada"), m("Thunder Wave","⚡","Suporte","Paralisa")] },
  moltres:     { types: ["Fogo","Voador"], moves: [m("Flamethrower","🔥","Alto","Lança chamas"), m("Fire Blast","🔥","Extremo","Bola de fogo"), m("Hurricane","🌪️","Muito Alto","Furacão"), m("Heat Wave","🔥","Alto","Dano em área")] },
  mew:         { types: ["Psiquico"], moves: [m("Psychic","🔮","Muito Alto","Onda psíquica"), m("Aura Sphere","✨","Alto","Nunca erra"), m("Ancient Power","💫","Alto","Pode aumentar status"), m("Recover","✨","Suporte","Recupera HP")] },
  mew_alt:     { types: ["Psiquico"], moves: [m("Psychic","🔮","Muito Alto","Onda psíquica"), m("Aura Sphere","✨","Alto","Nunca erra"), m("Ancient Power","💫","Alto","Pode aumentar status"), m("Recover","✨","Suporte","Recupera HP")] },
  mewtwo:      { types: ["Psiquico"], moves: [m("Psystrike","🧠","Extremo","Golpe mental"), m("Psychic","🔮","Muito Alto","Onda psíquica"), m("Shadow Ball","⚫","Alto","Bola sombria"), m("Recover","✨","Suporte","Recupera HP")] },
};

// Fallback genérico (para pets que não possuem entrada explícita)
export const DEFAULT_DEX: SpeciesDex = {
  types: ["Normal"],
  moves: [
    m("Tackle","💥","Baixo","Investida básica"),
    m("Quick Attack","⚡","Médio","Prioridade"),
    m("Body Slam","👊","Alto","Pode paralisar"),
    m("Hyper Beam","✨","Extremo","Raio devastador"),
  ],
};

export function getDex(species: Species): SpeciesDex {
  return (DEX[species] as SpeciesDex | undefined) ?? DEFAULT_DEX;
}

// Slot 0: lv 1, slot 1: lv 3, slot 2: lv 6, slot 3: lv 9 (a cada 3 níveis).
export const MOVE_UNLOCK_LEVEL: [number, number, number, number] = [1, 3, 6, 9];

export function isMoveUnlocked(slot: number, petLevel: number): boolean {
  return petLevel >= (MOVE_UNLOCK_LEVEL[slot] ?? 1);
}

export function unlockedMoves(species: Species, petLevel: number): MoveDef[] {
  const dex = getDex(species);
  return dex.moves.filter((_, i) => isMoveUnlocked(i, petLevel));
}

export function unlockedMoveIndices(petLevel: number): number[] {
  return [0, 1, 2, 3].filter((i) => isMoveUnlocked(i, petLevel));
}

export type SkillId = "tackle" | "heavy" | "special" | "guard";

// Mapeia um MoveDef para o mecanismo de batalha existente.
export function moveToSkillId(mv: MoveDef): SkillId {
  if (mv.power === "Suporte") return "guard";
  if (mv.power === "Extremo" || mv.power === "Muito Alto") return "heavy";
  if (mv.power === "Alto") return "special";
  return "tackle";
}

// Retorna até 4 índices de moves "em ações" para o pet (default = todos liberados).
export function resolveActionMoves(actionMoves: number[] | undefined, petLevel: number): number[] {
  const unlocked = unlockedMoveIndices(petLevel);
  if (!actionMoves || actionMoves.length === 0) return unlocked;
  const valid = actionMoves.filter((i) => unlocked.includes(i));
  return valid.length > 0 ? valid.slice(0, 4) : unlocked;
}
