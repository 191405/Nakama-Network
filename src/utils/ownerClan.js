

import {
    doc, setDoc, getDoc, serverTimestamp, collection,
    updateDoc, arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';

const OWNER_CONFIG = {
    OWNER_UID: 'OWNER_UID_PLACEHOLDER', 
    CLAN_ID: 'nakama-legends',
    CLAN_DATA: {
        name: 'Nakama Legends',
        tag: 'NKMΛ',
        description: 'The founding clan of Nakama Network. Where true legends are born. 🔥',
        isPrivate: false, 
        isFounderClan: true,
        maxMembers: 100,
        perks: [
            'Exclusive founder badge',
            'Priority in clan wars',
            '2x chakra bonus',
            'Access to founder-only content'
        ]
    }
};

export const initializeOwnerClan = async (ownerUid, ownerDisplayName) => {
    if (!ownerUid) {
        throw new Error('Owner UID is required');
    }

    const clanRef = doc(db, 'clans', OWNER_CONFIG.CLAN_ID);
    const existingClan = await getDoc(clanRef);

    if (existingClan.exists()) {
        console.log('Owner clan already exists');
        return { success: true, message: 'Clan already exists', id: OWNER_CONFIG.CLAN_ID };
    }

    const clanData = {
        ...OWNER_CONFIG.CLAN_DATA,
        leaderId: ownerUid,
        leaderName: ownerDisplayName || 'Founder',
        members: [ownerUid],
        memberCount: 1,
        totalChakra: 10000, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(clanRef, clanData);

    const userRef = doc(db, 'users', ownerUid);
    await updateDoc(userRef, {
        clanId: OWNER_CONFIG.CLAN_ID,
        clanRole: 'LEADER',
        isFounder: true,
        chakra: 10000 
    }).catch(() => {
        
        setDoc(userRef, {
            clanId: OWNER_CONFIG.CLAN_ID,
            clanRole: 'LEADER',
            isFounder: true,
            chakra: 10000,
            displayName: ownerDisplayName || 'Founder'
        }, { merge: true });
    });

    console.log('Owner clan created successfully!');
    return { success: true, message: 'Clan created', id: OWNER_CONFIG.CLAN_ID };
};

export const addMemberToOwnerClan = async (memberUid, memberDisplayName) => {
    const clanRef = doc(db, 'clans', OWNER_CONFIG.CLAN_ID);
    const clanSnap = await getDoc(clanRef);

    if (!clanSnap.exists()) {
        throw new Error('Owner clan not found');
    }

    const clanData = clanSnap.data();

    if (clanData.members?.includes(memberUid)) {
        return { success: false, message: 'Already a member' };
    }

    if (clanData.members?.length >= clanData.maxMembers) {
        return { success: false, message: 'Clan is full' };
    }

    await updateDoc(clanRef, {
        members: arrayUnion(memberUid),
        memberCount: (clanData.memberCount || 0) + 1,
        updatedAt: serverTimestamp()
    });

    const userRef = doc(db, 'users', memberUid);
    await updateDoc(userRef, {
        clanId: OWNER_CONFIG.CLAN_ID,
        clanRole: 'MEMBER'
    }).catch(() => {
        setDoc(userRef, {
            clanId: OWNER_CONFIG.CLAN_ID,
            clanRole: 'MEMBER',
            displayName: memberDisplayName
        }, { merge: true });
    });

    return { success: true, message: 'Member added' };
};

export const generateClanInvite = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/clan?join=${OWNER_CONFIG.CLAN_ID}`;
};

export default {
    initializeOwnerClan,
    addMemberToOwnerClan,
    generateClanInvite,
    OWNER_CLAN_ID: OWNER_CONFIG.CLAN_ID
};
