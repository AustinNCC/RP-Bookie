import { BetStatus, BetType, Receipt, Bet } from '../types';
import { formatDateTime, formatCurrency } from './dateUtils';

/**
 * Generates a plain text receipt for a bet
 */
export const generateReceipt = (receipt: Receipt): string => {
  const {
    betId,
    timestamp,
    customerName,
    employeeName,
    type,
    selections,
    wagerAmount,
    potentialPayout
  } = receipt;
  
  // Generate header
  let text = '';
  text += '==============================\n';
  text += '        BLARNEYS SPORTSBOOK        \n';
  text += '==============================\n\n';
  
  // Bet details
  text += `ID: ${betId.substring(0, 8)}\n`;
  text += `DATE: ${formatDateTime(timestamp)}\n`;
  text += `CUSTOMER: ${customerName}\n`;
  text += `TYPE: ${type === BetType.SINGLE ? 'SINGLE BET' : 'PARLAY'}\n\n`;
  
  // Selections
  text += 'SELECTIONS:\n';
  text += '------------------------------\n';
  
  selections.forEach((selection, index) => {
    text += `${index + 1}. ${selection.eventName}\n`;
    text += `   Selection: ${selection.selectionName}\n`;
    text += `   Odds: ${selection.odds}\n`;
    if (index < selections.length - 1) {
      text += '------------------------------\n';
    }
  });
  
  text += '==============================\n\n';
  
  // Financial details
  text += `WAGER: ${formatCurrency(wagerAmount)}\n`;
  text += `POTENTIAL PAYOUT: ${formatCurrency(potentialPayout)}\n\n`;
  
  // Footer
  text += '------------------------------\n';
  text += `Processed by: ${employeeName}\n`;
  text += 'Good luck!\n';
  text += '==============================\n';
  
  return text;
};

/**
 * Creates a receipt object from bet data
 */
export const createReceiptFromBet = (bet: Bet, employeeName: string): Receipt => {
  return {
    betId: bet.id,
    timestamp: bet.createdAt,
    customerId: bet.customerId,
    customerName: bet.customerName,
    employeeId: bet.employeeId,
    employeeName,
    type: bet.type,
    selections: bet.selections,
    wagerAmount: bet.wagerAmount,
    potentialPayout: bet.potentialPayout
  };
};