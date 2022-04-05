public with sharing class AccountController {

            @AuraEnabled(cacheable=true)
            public static List<Account> getAccounts() {
                return [
                    SELECT Name, owner.Name,phone,website,AnnualRevenue from Account where Industry = 'Financial Services'
                    WITH SECURITY_ENFORCED
                ];
            }
}
