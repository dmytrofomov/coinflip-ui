// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a CoinFlipGame contract in Tolk.
/* eslint-disable */

import * as c from '@ton/core';
import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';

// ————————————————————————————————————————————
//   predefined types and functions
//

type StoreCallback<T> = (obj: T, b: c.Builder) => void
type LoadCallback<T> = (s: c.Slice) => T

export type CellRef<T> = {
    ref: T
}

function makeCellFrom<T>(self: T, storeFn_T: StoreCallback<T>): c.Cell {
    let b = beginCell();
    storeFn_T(self, b);
    return b.endCell();
}

function loadAndCheckPrefix32(s: c.Slice, expected: number, structName: string): void {
    let prefix = s.loadUint(32);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected 0x${expected.toString(16).padStart(8, '0')}, got 0x${prefix.toString(16).padStart(8, '0')}`);
    }
}

function lookupPrefix(s: c.Slice, expected: number, prefixLen: number): boolean {
    return s.remainingBits >= prefixLen && s.preloadUint(prefixLen) === expected;
}

function throwNonePrefixMatch(fieldPath: string): never {
    throw new Error(`Incorrect prefix for '${fieldPath}': none of variants matched`);
}

function storeCellRef<T>(cell: CellRef<T>, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    let b_ref = c.beginCell();
    storeFn_T(cell.ref, b_ref);
    b.storeRef(b_ref.endCell());
}

function loadCellRef<T>(s: c.Slice, loadFn_T: LoadCallback<T>): CellRef<T> {
    let s_ref = s.loadRef().beginParse();
    return { ref: loadFn_T(s_ref) };
}

function storeTolkNullable<T>(v: T | null, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    if (v === null) {
        b.storeUint(0, 1);
    } else {
        b.storeUint(1, 1);
        storeFn_T(v, b);
    }
}

// ————————————————————————————————————————————
//   parse get methods result from a TVM stack
//

class StackReader {
    constructor(private tuple: c.TupleItem[]) {
    }

    static fromGetMethod(expectedN: number, getMethodResult: { stack: c.TupleReader }): StackReader {
        let tuple = [] as c.TupleItem[];
        while (getMethodResult.stack.remaining) {
            tuple.push(getMethodResult.stack.pop());
        }
        if (tuple.length !== expectedN) {
            throw new Error(`expected ${expectedN} stack width, got ${tuple.length}`);
        }
        return new StackReader(tuple);
    }

    private popExpecting<ItemT>(itemType: string): ItemT {
        const item = this.tuple.shift();
        if (item?.type === itemType) {
            return item as ItemT;
        }
        throw new Error(`not '${itemType}' on a stack`);
    }

    private popCellLike(): c.Cell {
        const item = this.tuple.shift();
        if (item && (item.type === 'cell' || item.type === 'slice' || item.type === 'builder')) {
            return item.cell;
        }
        throw new Error(`not cell/slice on a stack`);
    }

    readBigInt(): bigint {
        return this.popExpecting<c.TupleItemInt>('int').value;
    }

    readBoolean(): boolean {
        return this.popExpecting<c.TupleItemInt>('int').value !== 0n;
    }

    readCell(): c.Cell {
        return this.popCellLike();
    }

    readSlice(): c.Slice {
        return this.popCellLike().beginParse();
    }

    readNullable<T>(readFn_T: (r: StackReader) => T): T | null {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return null;
        }
        return readFn_T(this);
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint8 = bigint
type uint16 = bigint
type uint32 = bigint
type uint64 = bigint
type uint256 = bigint

/**
 > struct GameConfigExt {
 >     commitment: uint256
 >     treasury: address
 > }
 */
export interface GameConfigExt {
    readonly $: 'GameConfigExt'
    commitment: uint256
    treasury: c.Address
}

export const GameConfigExt = {
    create(args: {
        commitment: uint256
        treasury: c.Address
    }): GameConfigExt {
        return {
            $: 'GameConfigExt',
            ...args
        }
    },
    fromSlice(s: c.Slice): GameConfigExt {
        return {
            $: 'GameConfigExt',
            commitment: s.loadUintBig(256),
            treasury: s.loadAddress(),
        }
    },
    store(self: GameConfigExt, b: c.Builder): void {
        b.storeUint(self.commitment, 256);
        b.storeAddress(self.treasury);
    },
    toCell(self: GameConfigExt): c.Cell {
        return makeCellFrom<GameConfigExt>(self, GameConfigExt.store);
    }
}

/**
 > struct GameConfig {
 >     gameId: uint64
 >     factory: address
 >     creator: address
 >     stake: coins
 >     aSideHeads: bool
 >     feeBps: uint16
 >     revealTimeout: uint32
 >     joinDeadline: uint32
 >     ext: Cell<GameConfigExt>
 > }
 */
export interface GameConfig {
    readonly $: 'GameConfig'
    gameId: uint64
    factory: c.Address
    creator: c.Address
    stake: coins
    aSideHeads: boolean
    feeBps: uint16
    revealTimeout: uint32
    joinDeadline: uint32
    ext: CellRef<GameConfigExt>
}

export const GameConfig = {
    create(args: {
        gameId: uint64
        factory: c.Address
        creator: c.Address
        stake: coins
        aSideHeads: boolean
        feeBps: uint16
        revealTimeout: uint32
        joinDeadline: uint32
        ext: CellRef<GameConfigExt>
    }): GameConfig {
        return {
            $: 'GameConfig',
            ...args
        }
    },
    fromSlice(s: c.Slice): GameConfig {
        return {
            $: 'GameConfig',
            gameId: s.loadUintBig(64),
            factory: s.loadAddress(),
            creator: s.loadAddress(),
            stake: s.loadCoins(),
            aSideHeads: s.loadBoolean(),
            feeBps: s.loadUintBig(16),
            revealTimeout: s.loadUintBig(32),
            joinDeadline: s.loadUintBig(32),
            ext: loadCellRef<GameConfigExt>(s, GameConfigExt.fromSlice),
        }
    },
    store(self: GameConfig, b: c.Builder): void {
        b.storeUint(self.gameId, 64);
        b.storeAddress(self.factory);
        b.storeAddress(self.creator);
        b.storeCoins(self.stake);
        b.storeBit(self.aSideHeads);
        b.storeUint(self.feeBps, 16);
        b.storeUint(self.revealTimeout, 32);
        b.storeUint(self.joinDeadline, 32);
        storeCellRef<GameConfigExt>(self.ext, b, GameConfigExt.store);
    },
    toCell(self: GameConfig): c.Cell {
        return makeCellFrom<GameConfig>(self, GameConfig.store);
    }
}

/**
 > struct GameStorage {
 >     config: Cell<GameConfig>
 >     status: uint8
 >     opponent: address?
 >     seedB: uint256
 >     revealDeadline: uint32
 > }
 */
export interface GameStorage {
    readonly $: 'GameStorage'
    config: CellRef<GameConfig>
    status: uint8
    opponent: c.Address | null
    seedB: uint256
    revealDeadline: uint32
}

export const GameStorage = {
    create(args: {
        config: CellRef<GameConfig>
        status: uint8
        opponent: c.Address | null
        seedB: uint256
        revealDeadline: uint32
    }): GameStorage {
        return {
            $: 'GameStorage',
            ...args
        }
    },
    fromSlice(s: c.Slice): GameStorage {
        return {
            $: 'GameStorage',
            config: loadCellRef<GameConfig>(s, GameConfig.fromSlice),
            status: s.loadUintBig(8),
            opponent: s.loadMaybeAddress(),
            seedB: s.loadUintBig(256),
            revealDeadline: s.loadUintBig(32),
        }
    },
    store(self: GameStorage, b: c.Builder): void {
        storeCellRef<GameConfig>(self.config, b, GameConfig.store);
        b.storeUint(self.status, 8);
        b.storeAddress(self.opponent);
        b.storeUint(self.seedB, 256);
        b.storeUint(self.revealDeadline, 32);
    },
    toCell(self: GameStorage): c.Cell {
        return makeCellFrom<GameStorage>(self, GameStorage.store);
    }
}

/**
 > struct GameData {
 >     gameId: uint64
 >     factory: address
 >     creator: address
 >     stake: coins
 >     commitment: uint256
 >     aSideHeads: bool
 >     feeBps: uint16
 >     treasury: address
 >     joinDeadline: uint32
 >     status: uint8
 >     opponent: address?
 >     seedB: uint256
 >     revealDeadline: uint32
 > }
 */
export interface GameData {
    readonly $: 'GameData'
    gameId: uint64
    factory: c.Address
    creator: c.Address
    stake: coins
    commitment: uint256
    aSideHeads: boolean
    feeBps: uint16
    treasury: c.Address
    joinDeadline: uint32
    status: uint8
    opponent: c.Address | null
    seedB: uint256
    revealDeadline: uint32
}

export const GameData = {
    create(args: {
        gameId: uint64
        factory: c.Address
        creator: c.Address
        stake: coins
        commitment: uint256
        aSideHeads: boolean
        feeBps: uint16
        treasury: c.Address
        joinDeadline: uint32
        status: uint8
        opponent: c.Address | null
        seedB: uint256
        revealDeadline: uint32
    }): GameData {
        return {
            $: 'GameData',
            ...args
        }
    },
    fromSlice(s: c.Slice): GameData {
        return {
            $: 'GameData',
            gameId: s.loadUintBig(64),
            factory: s.loadAddress(),
            creator: s.loadAddress(),
            stake: s.loadCoins(),
            commitment: s.loadUintBig(256),
            aSideHeads: s.loadBoolean(),
            feeBps: s.loadUintBig(16),
            treasury: s.loadAddress(),
            joinDeadline: s.loadUintBig(32),
            status: s.loadUintBig(8),
            opponent: s.loadMaybeAddress(),
            seedB: s.loadUintBig(256),
            revealDeadline: s.loadUintBig(32),
        }
    },
    store(self: GameData, b: c.Builder): void {
        b.storeUint(self.gameId, 64);
        b.storeAddress(self.factory);
        b.storeAddress(self.creator);
        b.storeCoins(self.stake);
        b.storeUint(self.commitment, 256);
        b.storeBit(self.aSideHeads);
        b.storeUint(self.feeBps, 16);
        b.storeAddress(self.treasury);
        b.storeUint(self.joinDeadline, 32);
        b.storeUint(self.status, 8);
        b.storeAddress(self.opponent);
        b.storeUint(self.seedB, 256);
        b.storeUint(self.revealDeadline, 32);
    },
    toCell(self: GameData): c.Cell {
        return makeCellFrom<GameData>(self, GameData.store);
    }
}

/**
 > struct (0xc0f20001) JoinGame {
 >     seedB: uint256
 > }
 */
export interface JoinGame {
    readonly $: 'JoinGame'
    seedB: uint256
}

export const JoinGame = {
    PREFIX: 0xc0f20001,

    create(args: {
        seedB: uint256
    }): JoinGame {
        return {
            $: 'JoinGame',
            ...args
        }
    },
    fromSlice(s: c.Slice): JoinGame {
        loadAndCheckPrefix32(s, 0xc0f20001, 'JoinGame');
        return {
            $: 'JoinGame',
            seedB: s.loadUintBig(256),
        }
    },
    store(self: JoinGame, b: c.Builder): void {
        b.storeUint(0xc0f20001, 32);
        b.storeUint(self.seedB, 256);
    },
    toCell(self: JoinGame): c.Cell {
        return makeCellFrom<JoinGame>(self, JoinGame.store);
    }
}

/**
 > struct (0xc0f20002) Reveal {
 >     secretA: uint256
 > }
 */
export interface Reveal {
    readonly $: 'Reveal'
    secretA: uint256
}

export const Reveal = {
    PREFIX: 0xc0f20002,

    create(args: {
        secretA: uint256
    }): Reveal {
        return {
            $: 'Reveal',
            ...args
        }
    },
    fromSlice(s: c.Slice): Reveal {
        loadAndCheckPrefix32(s, 0xc0f20002, 'Reveal');
        return {
            $: 'Reveal',
            secretA: s.loadUintBig(256),
        }
    },
    store(self: Reveal, b: c.Builder): void {
        b.storeUint(0xc0f20002, 32);
        b.storeUint(self.secretA, 256);
    },
    toCell(self: Reveal): c.Cell {
        return makeCellFrom<Reveal>(self, Reveal.store);
    }
}

/**
 > struct (0xc0f20003) ClaimTimeout {
 > }
 */
export interface ClaimTimeout {
    readonly $: 'ClaimTimeout'
}

export const ClaimTimeout = {
    PREFIX: 0xc0f20003,

    create(): ClaimTimeout {
        return {
            $: 'ClaimTimeout',
        }
    },
    fromSlice(s: c.Slice): ClaimTimeout {
        loadAndCheckPrefix32(s, 0xc0f20003, 'ClaimTimeout');
        return {
            $: 'ClaimTimeout',
        }
    },
    store(self: ClaimTimeout, b: c.Builder): void {
        b.storeUint(0xc0f20003, 32);
    },
    toCell(self: ClaimTimeout): c.Cell {
        return makeCellFrom<ClaimTimeout>(self, ClaimTimeout.store);
    }
}

/**
 > struct (0xc0f20004) CancelGame {
 > }
 */
export interface CancelGame {
    readonly $: 'CancelGame'
}

export const CancelGame = {
    PREFIX: 0xc0f20004,

    create(): CancelGame {
        return {
            $: 'CancelGame',
        }
    },
    fromSlice(s: c.Slice): CancelGame {
        loadAndCheckPrefix32(s, 0xc0f20004, 'CancelGame');
        return {
            $: 'CancelGame',
        }
    },
    store(self: CancelGame, b: c.Builder): void {
        b.storeUint(0xc0f20004, 32);
    },
    toCell(self: CancelGame): c.Cell {
        return makeCellFrom<CancelGame>(self, CancelGame.store);
    }
}

/**
 > struct (0xc0fe0002) EvGameJoined {
 >     gameId: uint64
 >     opponent: address
 >     seedB: uint256
 >     revealDeadline: uint32
 > }
 */
export interface EvGameJoined {
    readonly $: 'EvGameJoined'
    gameId: uint64
    opponent: c.Address
    seedB: uint256
    revealDeadline: uint32
}

export const EvGameJoined = {
    PREFIX: 0xc0fe0002,

    create(args: {
        gameId: uint64
        opponent: c.Address
        seedB: uint256
        revealDeadline: uint32
    }): EvGameJoined {
        return {
            $: 'EvGameJoined',
            ...args
        }
    },
    fromSlice(s: c.Slice): EvGameJoined {
        loadAndCheckPrefix32(s, 0xc0fe0002, 'EvGameJoined');
        return {
            $: 'EvGameJoined',
            gameId: s.loadUintBig(64),
            opponent: s.loadAddress(),
            seedB: s.loadUintBig(256),
            revealDeadline: s.loadUintBig(32),
        }
    },
    store(self: EvGameJoined, b: c.Builder): void {
        b.storeUint(0xc0fe0002, 32);
        b.storeUint(self.gameId, 64);
        b.storeAddress(self.opponent);
        b.storeUint(self.seedB, 256);
        b.storeUint(self.revealDeadline, 32);
    },
    toCell(self: EvGameJoined): c.Cell {
        return makeCellFrom<EvGameJoined>(self, EvGameJoined.store);
    }
}

/**
 > struct (0xc0fe0003) EvGameSettled {
 >     gameId: uint64
 >     coinIsHeads: bool
 >     winner: address
 >     payout: coins
 >     fee: coins
 > }
 */
export interface EvGameSettled {
    readonly $: 'EvGameSettled'
    gameId: uint64
    coinIsHeads: boolean
    winner: c.Address
    payout: coins
    fee: coins
}

export const EvGameSettled = {
    PREFIX: 0xc0fe0003,

    create(args: {
        gameId: uint64
        coinIsHeads: boolean
        winner: c.Address
        payout: coins
        fee: coins
    }): EvGameSettled {
        return {
            $: 'EvGameSettled',
            ...args
        }
    },
    fromSlice(s: c.Slice): EvGameSettled {
        loadAndCheckPrefix32(s, 0xc0fe0003, 'EvGameSettled');
        return {
            $: 'EvGameSettled',
            gameId: s.loadUintBig(64),
            coinIsHeads: s.loadBoolean(),
            winner: s.loadAddress(),
            payout: s.loadCoins(),
            fee: s.loadCoins(),
        }
    },
    store(self: EvGameSettled, b: c.Builder): void {
        b.storeUint(0xc0fe0003, 32);
        b.storeUint(self.gameId, 64);
        b.storeBit(self.coinIsHeads);
        b.storeAddress(self.winner);
        b.storeCoins(self.payout);
        b.storeCoins(self.fee);
    },
    toCell(self: EvGameSettled): c.Cell {
        return makeCellFrom<EvGameSettled>(self, EvGameSettled.store);
    }
}

/**
 > struct (0xc0fe0004) EvGameTimedOut {
 >     gameId: uint64
 >     winner: address
 >     payout: coins
 >     fee: coins
 > }
 */
export interface EvGameTimedOut {
    readonly $: 'EvGameTimedOut'
    gameId: uint64
    winner: c.Address
    payout: coins
    fee: coins
}

export const EvGameTimedOut = {
    PREFIX: 0xc0fe0004,

    create(args: {
        gameId: uint64
        winner: c.Address
        payout: coins
        fee: coins
    }): EvGameTimedOut {
        return {
            $: 'EvGameTimedOut',
            ...args
        }
    },
    fromSlice(s: c.Slice): EvGameTimedOut {
        loadAndCheckPrefix32(s, 0xc0fe0004, 'EvGameTimedOut');
        return {
            $: 'EvGameTimedOut',
            gameId: s.loadUintBig(64),
            winner: s.loadAddress(),
            payout: s.loadCoins(),
            fee: s.loadCoins(),
        }
    },
    store(self: EvGameTimedOut, b: c.Builder): void {
        b.storeUint(0xc0fe0004, 32);
        b.storeUint(self.gameId, 64);
        b.storeAddress(self.winner);
        b.storeCoins(self.payout);
        b.storeCoins(self.fee);
    },
    toCell(self: EvGameTimedOut): c.Cell {
        return makeCellFrom<EvGameTimedOut>(self, EvGameTimedOut.store);
    }
}

/**
 > struct (0xc0fe0005) EvGameCancelled {
 >     gameId: uint64
 >     refund: coins
 > }
 */
export interface EvGameCancelled {
    readonly $: 'EvGameCancelled'
    gameId: uint64
    refund: coins
}

export const EvGameCancelled = {
    PREFIX: 0xc0fe0005,

    create(args: {
        gameId: uint64
        refund: coins
    }): EvGameCancelled {
        return {
            $: 'EvGameCancelled',
            ...args
        }
    },
    fromSlice(s: c.Slice): EvGameCancelled {
        loadAndCheckPrefix32(s, 0xc0fe0005, 'EvGameCancelled');
        return {
            $: 'EvGameCancelled',
            gameId: s.loadUintBig(64),
            refund: s.loadCoins(),
        }
    },
    store(self: EvGameCancelled, b: c.Builder): void {
        b.storeUint(0xc0fe0005, 32);
        b.storeUint(self.gameId, 64);
        b.storeCoins(self.refund);
    },
    toCell(self: EvGameCancelled): c.Cell {
        return makeCellFrom<EvGameCancelled>(self, EvGameCancelled.store);
    }
}

// ————————————————————————————————————————————
//    class CoinFlipGame
//

interface ExtraSendOptions {
    bounce?: boolean                    // default: false
    sendMode?: SendMode                 // default: SendMode.PAY_GAS_SEPARATELY
    extraCurrencies?: c.ExtraCurrency   // default: empty dict
}

interface DeployedAddrOptions {
    workchain?: number                  // default: 0 (basechain)
    toShard?: { fixedPrefixLength: number; closeTo: c.Address }
    overrideContractCode?: c.Cell
}

function calculateDeployedAddress(code: c.Cell, data: c.Cell, options: DeployedAddrOptions): c.Address {
    const stateInitCell = beginCell().store(c.storeStateInit({
        code,
        data,
        splitDepth: options.toShard?.fixedPrefixLength,
        special: null,
        libraries: null,
    })).endCell();

    let addrHash = stateInitCell.hash();
    if (options.toShard) {
        const shardDepth = options.toShard.fixedPrefixLength;
        addrHash = beginCell()
            .storeBits(new c.BitString(options.toShard.closeTo.hash, 0, shardDepth))
            .storeBits(new c.BitString(stateInitCell.hash(), shardDepth, 256 - shardDepth))
            .endCell()
            .beginParse().loadBuffer(32);
    }

    return new c.Address(options.workchain ?? 0, addrHash);
}

export class CoinFlipGame implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECDwEAA38AART/APSkE/S88sgLAQIBYgIDBFTQ+JGRMOAg1ywmB5AADOMC1ywmB5AAFOMC1ywmB5AAHOMC1ywmB5AAJDEEBQYHAgFuDQ4C/jHtRNDU0wf6UDHT/zHTHzHR8tBrINDTP/pIMfpI+gDSADHTDzHTH9Mf1DHR+CO+8uBs+JJQA8cF8tBq+Jchggr68ICgvvLgaPgnbxAhqgCCCvrwgKC+8uBt+JIF1wv/IPgjUASgBcjMz4QGFvpUEsv/I88LH8ntVPiSyInPFhMICQH+Me1E0NTTB/pQ0//TH9EDwAHy4Gsj0NM/+kgx+kj6ANIA0w/THzHTHzHU0dDT//pI0fiSJscF8uBl+CMqu/LgbwvXC/8gyMv/z1D5Ali68uBuJrJxsMABUgO6VBBH4wQCqgBSBKiBJxCpBAjIzM+EChb6VBTL/xXLH8ntVFE0oQoB/lvtRNDU0wf6UNP/0x/RA8AB8uBr+CMjvPLgcCPQ0z/6SDH6SDH6ANIAMdMP0x8x0x8x1NHQ0/8x+kjRJQOqAFIDqIEnEKkECMjMz4QOFvpUFMv/Fcsfye1UURShyM+TA/gAEhLLP1Iw+lIB+gIj+gLJyM+PGAAEdM8L93HPC2ELAf6OdzDtRNDU0wf6UNP/0x/RA/LQayPQ0z/6SDH6SPoAMdIAMdMPMdMfMdMfMdQx0fiSIccF8uBlBcjMz4QSE/pUy/8Syx/J7VT4J28QyM+PGAAEdc8L94IQwP4ABc8LgRLLPwH6Aslw+wDIz4UI+lJwzwtuyYEAoPsA4IQPAccADAAIwP4AAgCMyz8S+lITy//LH8nIz48YAARyzwv3cc8LYczJcPsA+Jeiggr68IChIIIImJaAvo4T+JLIz4UI+lIB+gJwzwtqyXD7AJEw4gCsyM+TA/gADhTLPxLKAFIQ+lJY+gIi+gLJyM+PGAAEc88L93HPC2HMyXD7ACHCAI4SyM+FCBP6UgH6AnDPC2rJcfsAkmwh4sjPhQj6UnDPC27JgQCg+wAAXszJcPsAIsIAjhHIz4UI+lJY+gJwzwtqyXH7AJIwMeLIz4UI+lJwzwtuyYEAoPsAAATy9AB3t0T9qJoammD/Shp/+mP6IJoaZ/9JH0kfQBpAGmH6Y+Y6Y/qaOhp//0kaIhGCD2INQgsjAgjiBsiCqGAQACe1sR2omhqGOmD/SgY6f+Y6Y+Y6MA==');

    static Errors = {
        'Errors.NotCreator': 101,
        'Errors.InsufficientValue': 104,
        'Errors.SelfPlayNotAllowed': 106,
        'Errors.WrongState': 107,
        'Errors.JoinDeadlinePassed': 108,
        'Errors.EscrowUnderfunded': 109,
        'Errors.CommitmentMismatch': 110,
        'Errors.RevealDeadlinePassed': 111,
        'Errors.RevealDeadlineNotReached': 112,
        'Errors.InvalidMessage': 65535,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new CoinFlipGame(address);
    }

    static fromStorage(emptyStorage: {
        config: CellRef<GameConfig>
        status: uint8
        opponent: c.Address | null
        seedB: uint256
        revealDeadline: uint32
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? CoinFlipGame.CodeCell,
            data: GameStorage.toCell(GameStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new CoinFlipGame(address, initialState);
    }

    static createCellOfJoinGame(body: {
        seedB: uint256
    }) {
        return JoinGame.toCell(JoinGame.create(body));
    }

    static createCellOfReveal(body: {
        secretA: uint256
    }) {
        return Reveal.toCell(Reveal.create(body));
    }

    static createCellOfClaimTimeout(body: {
    }) {
        return ClaimTimeout.toCell(ClaimTimeout.create());
    }

    static createCellOfCancelGame(body: {
    }) {
        return CancelGame.toCell(CancelGame.create());
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendJoinGame(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        seedB: uint256
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: JoinGame.toCell(JoinGame.create(body)),
            ...extraOptions
        });
    }

    async sendReveal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        secretA: uint256
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Reveal.toCell(Reveal.create(body)),
            ...extraOptions
        });
    }

    async sendClaimTimeout(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ClaimTimeout.toCell(ClaimTimeout.create()),
            ...extraOptions
        });
    }

    async sendCancelGame(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CancelGame.toCell(CancelGame.create()),
            ...extraOptions
        });
    }

    async getGameData(provider: ContractProvider): Promise<GameData> {
        const r = StackReader.fromGetMethod(13, await provider.get('gameData', []));
        return ({
            $: 'GameData',
            gameId: r.readBigInt(),
            factory: r.readSlice().loadAddress(),
            creator: r.readSlice().loadAddress(),
            stake: r.readBigInt(),
            commitment: r.readBigInt(),
            aSideHeads: r.readBoolean(),
            feeBps: r.readBigInt(),
            treasury: r.readSlice().loadAddress(),
            joinDeadline: r.readBigInt(),
            status: r.readBigInt(),
            opponent: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            seedB: r.readBigInt(),
            revealDeadline: r.readBigInt(),
        });
    }

    async getGameStatus(provider: ContractProvider): Promise<bigint> {
        const r = StackReader.fromGetMethod(1, await provider.get('gameStatus', []));
        return r.readBigInt();
    }
}
