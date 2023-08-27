public class Motorola_AssignmentController {
    @AuraEnabled (cacheable=true)
    public static List<Assignment__c> getAssignmentRecords(Integer pageSize, Integer pageNumber){
        try {
            Integer offset = (pageNumber - 1) * pageSize;
            return [SELECT ID, Status__c, Title__c, Description__c, DueDate__c FROM Assignment__c ORDER BY DueDate__c LIMIT :pageSize OFFSET :offset];
        } catch (Exception ex) {
            System.debug('Error in fetching records: ' +ex.getMessage());
            return null;
        }
    }

    @AuraEnabled(cacheable = false)
    public static void insertAssignmentList(Object assignInstance){
        try {
            
            if(assignInstance != null){
                Assignment__c assignObject = (Assignment__c) JSON.deserialize(JSON.serialize(assignInstance), Assignment__c.class);
                insert assignObject;
            }
			
            /*
             * String title, String Description, String Status, Date dueDate
            Assignment__c assignObject = new Assignment__c();
            assignObject.Title__c = title;
            assignObject.Description__c = Description;
            assignObject.DueDate__c = dueDate;
            assignObject.Status__c = Status;
			insert assignObject;
            */
            
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled (cacheable=true)

    public static List<Assignment__c> getAllAssignmentList(){

        try {

            return [SELECT ID, Status__c, Title__c, Description__c, DueDate__c FROM Assignment__c];

        } catch (Exception ex) {

            System.debug('Error in fetching records: ' +ex.getMessage());

            return null;

        }

    }


}