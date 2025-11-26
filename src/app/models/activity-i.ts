export interface ActivityI {
id: string;
title: string;
date: string;
status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
}
