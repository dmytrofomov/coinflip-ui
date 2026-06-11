// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a CoinFlipFactory contract in Tolk.
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

    readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
        return { ref: loadFn_T(this.readCell().beginParse()) };
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint16 = bigint
type uint32 = bigint
type uint64 = bigint
type uint256 = bigint

/**
 > struct FactoryGov {
 >     admin: address
 >     pendingAdmin: address?
 > }
 */
export interface FactoryGov {
    readonly $: 'FactoryGov'
    admin: c.Address
    pendingAdmin: c.Address | null
}

export const FactoryGov = {
    create(args: {
        admin: c.Address
        pendingAdmin: c.Address | null
    }): FactoryGov {
        return {
            $: 'FactoryGov',
            ...args
        }
    },
    fromSlice(s: c.Slice): FactoryGov {
        return {
            $: 'FactoryGov',
            admin: s.loadAddress(),
            pendingAdmin: s.loadMaybeAddress(),
        }
    },
    store(self: FactoryGov, b: c.Builder): void {
        b.storeAddress(self.admin);
        b.storeAddress(self.pendingAdmin);
    },
    toCell(self: FactoryGov): c.Cell {
        return makeCellFrom<FactoryGov>(self, FactoryGov.store);
    }
}

/**
 > struct FactoryStorage {
 >     gov: Cell<FactoryGov>
 >     treasury: address
 >     feeBps: uint16
 >     minStake: coins
 >     maxStake: coins
 >     joinTimeout: uint32
 >     revealTimeout: uint32
 >     paused: bool
 >     gamesCount: uint64
 >     gameCode: cell
 > }
 */
export interface FactoryStorage {
    readonly $: 'FactoryStorage'
    gov: CellRef<FactoryGov>
    treasury: c.Address
    feeBps: uint16
    minStake: coins
    maxStake: coins
    joinTimeout: uint32
    revealTimeout: uint32
    paused: boolean
    gamesCount: uint64
    gameCode: c.Cell
}

export const FactoryStorage = {
    create(args: {
        gov: CellRef<FactoryGov>
        treasury: c.Address
        feeBps: uint16
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
        paused: boolean
        gamesCount: uint64
        gameCode: c.Cell
    }): FactoryStorage {
        return {
            $: 'FactoryStorage',
            ...args
        }
    },
    fromSlice(s: c.Slice): FactoryStorage {
        return {
            $: 'FactoryStorage',
            gov: loadCellRef<FactoryGov>(s, FactoryGov.fromSlice),
            treasury: s.loadAddress(),
            feeBps: s.loadUintBig(16),
            minStake: s.loadCoins(),
            maxStake: s.loadCoins(),
            joinTimeout: s.loadUintBig(32),
            revealTimeout: s.loadUintBig(32),
            paused: s.loadBoolean(),
            gamesCount: s.loadUintBig(64),
            gameCode: s.loadRef(),
        }
    },
    store(self: FactoryStorage, b: c.Builder): void {
        storeCellRef<FactoryGov>(self.gov, b, FactoryGov.store);
        b.storeAddress(self.treasury);
        b.storeUint(self.feeBps, 16);
        b.storeCoins(self.minStake);
        b.storeCoins(self.maxStake);
        b.storeUint(self.joinTimeout, 32);
        b.storeUint(self.revealTimeout, 32);
        b.storeBit(self.paused);
        b.storeUint(self.gamesCount, 64);
        b.storeRef(self.gameCode);
    },
    toCell(self: FactoryStorage): c.Cell {
        return makeCellFrom<FactoryStorage>(self, FactoryStorage.store);
    }
}

/**
 > struct GovernanceData {
 >     admin: address
 >     pendingAdmin: address?
 >     treasury: address
 > }
 */
export interface GovernanceData {
    readonly $: 'GovernanceData'
    admin: c.Address
    pendingAdmin: c.Address | null
    treasury: c.Address
}

export const GovernanceData = {
    create(args: {
        admin: c.Address
        pendingAdmin: c.Address | null
        treasury: c.Address
    }): GovernanceData {
        return {
            $: 'GovernanceData',
            ...args
        }
    },
    fromSlice(s: c.Slice): GovernanceData {
        return {
            $: 'GovernanceData',
            admin: s.loadAddress(),
            pendingAdmin: s.loadMaybeAddress(),
            treasury: s.loadAddress(),
        }
    },
    store(self: GovernanceData, b: c.Builder): void {
        b.storeAddress(self.admin);
        b.storeAddress(self.pendingAdmin);
        b.storeAddress(self.treasury);
    },
    toCell(self: GovernanceData): c.Cell {
        return makeCellFrom<GovernanceData>(self, GovernanceData.store);
    }
}

/**
 > struct (0xc0f10001) CreateGame {
 >     stake: coins
 >     commitment: uint256
 >     aSideHeads: bool
 > }
 */
export interface CreateGame {
    readonly $: 'CreateGame'
    stake: coins
    commitment: uint256
    aSideHeads: boolean
}

export const CreateGame = {
    PREFIX: 0xc0f10001,

    create(args: {
        stake: coins
        commitment: uint256
        aSideHeads: boolean
    }): CreateGame {
        return {
            $: 'CreateGame',
            ...args
        }
    },
    fromSlice(s: c.Slice): CreateGame {
        loadAndCheckPrefix32(s, 0xc0f10001, 'CreateGame');
        return {
            $: 'CreateGame',
            stake: s.loadCoins(),
            commitment: s.loadUintBig(256),
            aSideHeads: s.loadBoolean(),
        }
    },
    store(self: CreateGame, b: c.Builder): void {
        b.storeUint(0xc0f10001, 32);
        b.storeCoins(self.stake);
        b.storeUint(self.commitment, 256);
        b.storeBit(self.aSideHeads);
    },
    toCell(self: CreateGame): c.Cell {
        return makeCellFrom<CreateGame>(self, CreateGame.store);
    }
}

/**
 > struct (0xc0f10002) SetFee {
 >     feeBps: uint16
 > }
 */
export interface SetFee {
    readonly $: 'SetFee'
    feeBps: uint16
}

export const SetFee = {
    PREFIX: 0xc0f10002,

    create(args: {
        feeBps: uint16
    }): SetFee {
        return {
            $: 'SetFee',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetFee {
        loadAndCheckPrefix32(s, 0xc0f10002, 'SetFee');
        return {
            $: 'SetFee',
            feeBps: s.loadUintBig(16),
        }
    },
    store(self: SetFee, b: c.Builder): void {
        b.storeUint(0xc0f10002, 32);
        b.storeUint(self.feeBps, 16);
    },
    toCell(self: SetFee): c.Cell {
        return makeCellFrom<SetFee>(self, SetFee.store);
    }
}

/**
 > struct (0xc0f10003) SetLimits {
 >     minStake: coins
 >     maxStake: coins
 >     joinTimeout: uint32
 >     revealTimeout: uint32
 > }
 */
export interface SetLimits {
    readonly $: 'SetLimits'
    minStake: coins
    maxStake: coins
    joinTimeout: uint32
    revealTimeout: uint32
}

export const SetLimits = {
    PREFIX: 0xc0f10003,

    create(args: {
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
    }): SetLimits {
        return {
            $: 'SetLimits',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetLimits {
        loadAndCheckPrefix32(s, 0xc0f10003, 'SetLimits');
        return {
            $: 'SetLimits',
            minStake: s.loadCoins(),
            maxStake: s.loadCoins(),
            joinTimeout: s.loadUintBig(32),
            revealTimeout: s.loadUintBig(32),
        }
    },
    store(self: SetLimits, b: c.Builder): void {
        b.storeUint(0xc0f10003, 32);
        b.storeCoins(self.minStake);
        b.storeCoins(self.maxStake);
        b.storeUint(self.joinTimeout, 32);
        b.storeUint(self.revealTimeout, 32);
    },
    toCell(self: SetLimits): c.Cell {
        return makeCellFrom<SetLimits>(self, SetLimits.store);
    }
}

/**
 > struct (0xc0f10004) SetTreasury {
 >     treasury: address
 > }
 */
export interface SetTreasury {
    readonly $: 'SetTreasury'
    treasury: c.Address
}

export const SetTreasury = {
    PREFIX: 0xc0f10004,

    create(args: {
        treasury: c.Address
    }): SetTreasury {
        return {
            $: 'SetTreasury',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetTreasury {
        loadAndCheckPrefix32(s, 0xc0f10004, 'SetTreasury');
        return {
            $: 'SetTreasury',
            treasury: s.loadAddress(),
        }
    },
    store(self: SetTreasury, b: c.Builder): void {
        b.storeUint(0xc0f10004, 32);
        b.storeAddress(self.treasury);
    },
    toCell(self: SetTreasury): c.Cell {
        return makeCellFrom<SetTreasury>(self, SetTreasury.store);
    }
}

/**
 > struct (0xc0f10005) SetPaused {
 >     paused: bool
 > }
 */
export interface SetPaused {
    readonly $: 'SetPaused'
    paused: boolean
}

export const SetPaused = {
    PREFIX: 0xc0f10005,

    create(args: {
        paused: boolean
    }): SetPaused {
        return {
            $: 'SetPaused',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetPaused {
        loadAndCheckPrefix32(s, 0xc0f10005, 'SetPaused');
        return {
            $: 'SetPaused',
            paused: s.loadBoolean(),
        }
    },
    store(self: SetPaused, b: c.Builder): void {
        b.storeUint(0xc0f10005, 32);
        b.storeBit(self.paused);
    },
    toCell(self: SetPaused): c.Cell {
        return makeCellFrom<SetPaused>(self, SetPaused.store);
    }
}

/**
 > struct (0xc0f10006) SetGameCode {
 >     code: cell
 > }
 */
export interface SetGameCode {
    readonly $: 'SetGameCode'
    code: c.Cell
}

export const SetGameCode = {
    PREFIX: 0xc0f10006,

    create(args: {
        code: c.Cell
    }): SetGameCode {
        return {
            $: 'SetGameCode',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetGameCode {
        loadAndCheckPrefix32(s, 0xc0f10006, 'SetGameCode');
        return {
            $: 'SetGameCode',
            code: s.loadRef(),
        }
    },
    store(self: SetGameCode, b: c.Builder): void {
        b.storeUint(0xc0f10006, 32);
        b.storeRef(self.code);
    },
    toCell(self: SetGameCode): c.Cell {
        return makeCellFrom<SetGameCode>(self, SetGameCode.store);
    }
}

/**
 > struct (0xc0f10007) ProposeAdmin {
 >     newAdmin: address
 > }
 */
export interface ProposeAdmin {
    readonly $: 'ProposeAdmin'
    newAdmin: c.Address
}

export const ProposeAdmin = {
    PREFIX: 0xc0f10007,

    create(args: {
        newAdmin: c.Address
    }): ProposeAdmin {
        return {
            $: 'ProposeAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ProposeAdmin {
        loadAndCheckPrefix32(s, 0xc0f10007, 'ProposeAdmin');
        return {
            $: 'ProposeAdmin',
            newAdmin: s.loadAddress(),
        }
    },
    store(self: ProposeAdmin, b: c.Builder): void {
        b.storeUint(0xc0f10007, 32);
        b.storeAddress(self.newAdmin);
    },
    toCell(self: ProposeAdmin): c.Cell {
        return makeCellFrom<ProposeAdmin>(self, ProposeAdmin.store);
    }
}

/**
 > struct (0xc0f10008) ClaimAdmin {
 > }
 */
export interface ClaimAdmin {
    readonly $: 'ClaimAdmin'
}

export const ClaimAdmin = {
    PREFIX: 0xc0f10008,

    create(): ClaimAdmin {
        return {
            $: 'ClaimAdmin',
        }
    },
    fromSlice(s: c.Slice): ClaimAdmin {
        loadAndCheckPrefix32(s, 0xc0f10008, 'ClaimAdmin');
        return {
            $: 'ClaimAdmin',
        }
    },
    store(self: ClaimAdmin, b: c.Builder): void {
        b.storeUint(0xc0f10008, 32);
    },
    toCell(self: ClaimAdmin): c.Cell {
        return makeCellFrom<ClaimAdmin>(self, ClaimAdmin.store);
    }
}

/**
 > struct (0xc0f10009) CancelAdminTransfer {
 > }
 */
export interface CancelAdminTransfer {
    readonly $: 'CancelAdminTransfer'
}

export const CancelAdminTransfer = {
    PREFIX: 0xc0f10009,

    create(): CancelAdminTransfer {
        return {
            $: 'CancelAdminTransfer',
        }
    },
    fromSlice(s: c.Slice): CancelAdminTransfer {
        loadAndCheckPrefix32(s, 0xc0f10009, 'CancelAdminTransfer');
        return {
            $: 'CancelAdminTransfer',
        }
    },
    store(self: CancelAdminTransfer, b: c.Builder): void {
        b.storeUint(0xc0f10009, 32);
    },
    toCell(self: CancelAdminTransfer): c.Cell {
        return makeCellFrom<CancelAdminTransfer>(self, CancelAdminTransfer.store);
    }
}

/**
 > struct (0xc0fe0001) EvGameCreated {
 >     gameId: uint64
 >     game: address
 >     creator: address
 >     stake: coins
 >     joinDeadline: uint32
 > }
 */
export interface EvGameCreated {
    readonly $: 'EvGameCreated'
    gameId: uint64
    game: c.Address
    creator: c.Address
    stake: coins
    joinDeadline: uint32
}

export const EvGameCreated = {
    PREFIX: 0xc0fe0001,

    create(args: {
        gameId: uint64
        game: c.Address
        creator: c.Address
        stake: coins
        joinDeadline: uint32
    }): EvGameCreated {
        return {
            $: 'EvGameCreated',
            ...args
        }
    },
    fromSlice(s: c.Slice): EvGameCreated {
        loadAndCheckPrefix32(s, 0xc0fe0001, 'EvGameCreated');
        return {
            $: 'EvGameCreated',
            gameId: s.loadUintBig(64),
            game: s.loadAddress(),
            creator: s.loadAddress(),
            stake: s.loadCoins(),
            joinDeadline: s.loadUintBig(32),
        }
    },
    store(self: EvGameCreated, b: c.Builder): void {
        b.storeUint(0xc0fe0001, 32);
        b.storeUint(self.gameId, 64);
        b.storeAddress(self.game);
        b.storeAddress(self.creator);
        b.storeCoins(self.stake);
        b.storeUint(self.joinDeadline, 32);
    },
    toCell(self: EvGameCreated): c.Cell {
        return makeCellFrom<EvGameCreated>(self, EvGameCreated.store);
    }
}

// ————————————————————————————————————————————
//    class CoinFlipFactory
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

export class CoinFlipFactory implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECEwEABJEAART/APSkE/S88sgLAQIBYgIDBPjQ+JGRMOAg1ywmB4gADOMC1ywmB4gAFI5QMe1E0NT6SNMPMfoA+gDTH9Mf0gDTP9TR+JIp0PpI+lAx0ccF8uBkCdcLDyCBA+i78uBpCMjMF/pSF8sPUAT6Alj6Assfyx8SygDLP8zJ7VTg1ywmB4gAHOMC1ywmB4gAJOMCBAUGBwIBIA8QAf4x7UTQ1PpI0w/6APoA0x/TH9IA0z/U0SLy0GYK+gDT/9cKAFMovpVTJ7vDAJFw4vLgZ/iXI4IQBfXhAKC+8uBoI6QMyMxSsPpSKs8LD1AJ+gJQB/oCJc8LHyTPCx8TygAZyz8pzxTJ7VT4I1ADoPgo+JIFyMv/GPpSySjIyz8YCADeMe1E0NT6SNMP+gAx+gAx0x8x0x8x0gDTP9TR+JIm0PpI+lAx0ccF8uBkBvoA+gDTH9cLHyPCAJRdu8MAkXDi8uBxIcIAlSDCAMMAkXDi8uBxCMjMF/pSFcsPAfoCUAP6AhPLHxPLH8oAyz/Mye1UAI4x7UTQ1PpIMdMP+gD6ANMf0x/SANM/1NH4kinQ+kj6UDHRxwXy4GQJ+kgwCMjMGPpSFssPUAT6Alj6Assfyx/KAMs/zMntVATOidcnjkgx7UTQ1PpI0w/6APoA0x/TH9IAMdM/1NH4kinQ+kj6UDHRxwXy4GQJ1woACMjMF/pSFcsPUAP6AgH6Assfyx8SygDLP8zJ7VTg1ywmB4gANOMC1ywmB4gAPOMC1ywmB4gARAoLDA0B/PpSFPpSIvoCFMoAFMsPEssfIc8LHxPMyW0ByMzPhAL6VHDPC//PkAAAAALJUwTIz4TQzMz5FsjPigBAy//PUPiSyM+TA/gABhbLP/pSFPpSAfoCyx/JyM+PGAAEcc8L93HPC2HMyXD7AMjPiQgBUxLIz4TQzMz5Fs8L/4EAjAkAFs8LdBLMzMmAQPsAAAjA8QAFAI4x7UTQ1PpI0w/6APoA0x/TH9IA0z/UMdH4kinQ+kj6UDHRxwXy4GQJ10wIyMwX+lIVyw9QA/oCAfoCyx/LH8oAEss/zMntVACeMe1E0NT6SNMP+gD6ANMf0x/SANM/1NEJ0PpI+lAx0fiSIccF8uBkCvpIMArI+lIa+lTJyMwX+lIVyw9QA/oCAfoCyx/LH8oAEss/zMntVAHGjk9b7UTQ1PpI0w/6APoA0x/TH9IA0z/U0QnQ+kgx+lDRIG7y0HP4kiHHBfLgcm0ByPpS+lTJyMwY+lIWyw9QBPoCWPoCyx/LH8oAyz/Mye1U4NcsJgeIAEwx4wKEDwHHAPL0DgCUMO1E0NT6SNMP+gD6ANMf0x/SANM/1NEJ0PpI+lAx0fiSIccF8uBkbQHI+lL6VMnIzBj6UhbLD1AE+gJY+gLLH8sfygDLP8zJ7VQAUbzBx2omhqfSRph5j9ABj9ABjpj5jpj5jpABjpn5jqGOiA6H0kfShorEAgFIERIAQ7U33aiaGoY/SQY6YeY/QAY/QAY6Y+Y6Y+Y6QAY6Z/qGOjAAMbR+HaiaGp9JGmH/QB9AGmP6Y/pAGmf6mjA=');

    static Errors = {
        'Errors.NotAdmin': 100,
        'Errors.GamePaused': 102,
        'Errors.InvalidStake': 103,
        'Errors.InsufficientValue': 104,
        'Errors.FeeTooHigh': 105,
        'Errors.InvalidLimits': 113,
        'Errors.NotPendingAdmin': 114,
        'Errors.NoPendingAdmin': 115,
        'Errors.InvalidMessage': 65535,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new CoinFlipFactory(address);
    }

    static fromStorage(emptyStorage: {
        gov: CellRef<FactoryGov>
        treasury: c.Address
        feeBps: uint16
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
        paused: boolean
        gamesCount: uint64
        gameCode: c.Cell
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? CoinFlipFactory.CodeCell,
            data: FactoryStorage.toCell(FactoryStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new CoinFlipFactory(address, initialState);
    }

    static createCellOfCreateGame(body: {
        stake: coins
        commitment: uint256
        aSideHeads: boolean
    }) {
        return CreateGame.toCell(CreateGame.create(body));
    }

    static createCellOfSetFee(body: {
        feeBps: uint16
    }) {
        return SetFee.toCell(SetFee.create(body));
    }

    static createCellOfSetLimits(body: {
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
    }) {
        return SetLimits.toCell(SetLimits.create(body));
    }

    static createCellOfSetTreasury(body: {
        treasury: c.Address
    }) {
        return SetTreasury.toCell(SetTreasury.create(body));
    }

    static createCellOfSetPaused(body: {
        paused: boolean
    }) {
        return SetPaused.toCell(SetPaused.create(body));
    }

    static createCellOfSetGameCode(body: {
        code: c.Cell
    }) {
        return SetGameCode.toCell(SetGameCode.create(body));
    }

    static createCellOfProposeAdmin(body: {
        newAdmin: c.Address
    }) {
        return ProposeAdmin.toCell(ProposeAdmin.create(body));
    }

    static createCellOfClaimAdmin(body: {
    }) {
        return ClaimAdmin.toCell(ClaimAdmin.create());
    }

    static createCellOfCancelAdminTransfer(body: {
    }) {
        return CancelAdminTransfer.toCell(CancelAdminTransfer.create());
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendCreateGame(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        stake: coins
        commitment: uint256
        aSideHeads: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CreateGame.toCell(CreateGame.create(body)),
            ...extraOptions
        });
    }

    async sendSetFee(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        feeBps: uint16
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetFee.toCell(SetFee.create(body)),
            ...extraOptions
        });
    }

    async sendSetLimits(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetLimits.toCell(SetLimits.create(body)),
            ...extraOptions
        });
    }

    async sendSetTreasury(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        treasury: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetTreasury.toCell(SetTreasury.create(body)),
            ...extraOptions
        });
    }

    async sendSetPaused(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        paused: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetPaused.toCell(SetPaused.create(body)),
            ...extraOptions
        });
    }

    async sendSetGameCode(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        code: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetGameCode.toCell(SetGameCode.create(body)),
            ...extraOptions
        });
    }

    async sendProposeAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        newAdmin: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ProposeAdmin.toCell(ProposeAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendClaimAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ClaimAdmin.toCell(ClaimAdmin.create()),
            ...extraOptions
        });
    }

    async sendCancelAdminTransfer(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CancelAdminTransfer.toCell(CancelAdminTransfer.create()),
            ...extraOptions
        });
    }

    async getFactoryData(provider: ContractProvider): Promise<FactoryStorage> {
        const r = StackReader.fromGetMethod(10, await provider.get('factoryData', []));
        return ({
            $: 'FactoryStorage',
            gov: r.readCellRef<FactoryGov>(FactoryGov.fromSlice),
            treasury: r.readSlice().loadAddress(),
            feeBps: r.readBigInt(),
            minStake: r.readBigInt(),
            maxStake: r.readBigInt(),
            joinTimeout: r.readBigInt(),
            revealTimeout: r.readBigInt(),
            paused: r.readBoolean(),
            gamesCount: r.readBigInt(),
            gameCode: r.readCell(),
        });
    }

    async getGamesCount(provider: ContractProvider): Promise<bigint> {
        const r = StackReader.fromGetMethod(1, await provider.get('gamesCount', []));
        return r.readBigInt();
    }

    async getGovernance(provider: ContractProvider): Promise<GovernanceData> {
        const r = StackReader.fromGetMethod(3, await provider.get('governance', []));
        return ({
            $: 'GovernanceData',
            admin: r.readSlice().loadAddress(),
            pendingAdmin: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            treasury: r.readSlice().loadAddress(),
        });
    }
}
