//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const gnfd_get_account_balanceEval: EvalFunction = {
    name: 'gnfd_get_account_balance Tool Evaluation',
    description: 'Evaluates the accuracy and completeness of the gnfd_get_account_balance tool',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please retrieve the account balance for the address 0xABC123 on the Greenfield network.");
        return JSON.parse(result);
    }
};

const gnfd_get_all_spsEval: EvalFunction = {
    name: "gnfd_get_all_sps Evaluation",
    description: "Evaluates the retrieval of all storage providers in the Greenfield network",
    run: async () => {
        const result = await grade(openai("gpt-4"), "List all the storage providers in the Greenfield network.");
        return JSON.parse(result);
    }
};

const gnfd_get_payment_accountsEval: EvalFunction = {
    name: "gnfd_get_payment_accounts Evaluation",
    description: "Evaluates the retrieval of payment accounts for a given address on the Greenfield network",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please retrieve the payment accounts for the address 0x123456 using gnfd_get_payment_accounts. If no address is provided, use the private key instead.");
        return JSON.parse(result);
    }
};

const gnfd_create_payment_accountEval: EvalFunction = {
    name: 'gnfd_create_payment_accountEval',
    description: 'Evaluates creation of a new payment account on the Greenfield network',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please create a new payment account on the Greenfield network using this private key: 0x1234567890abcdef");
        return JSON.parse(result);
    }
};

const gnfd_deposit_to_paymentEval: EvalFunction = {
    name: 'gnfd_deposit_to_paymentEval',
    description: 'Evaluates the deposit of funds into a payment account',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please deposit 5 BNB into the payment account at address 0x123456789ABCDEF to confirm the transaction steps.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [gnfd_get_account_balanceEval, gnfd_get_all_spsEval, gnfd_get_payment_accountsEval, gnfd_create_payment_accountEval, gnfd_deposit_to_paymentEval]
};
  
export default config;
  
export const evals = [gnfd_get_account_balanceEval, gnfd_get_all_spsEval, gnfd_get_payment_accountsEval, gnfd_create_payment_accountEval, gnfd_deposit_to_paymentEval];