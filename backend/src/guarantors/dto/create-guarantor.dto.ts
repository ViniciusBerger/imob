export class CreateGuarantorDto {
    name: string;
    document: string;
    email: string;
    phone: string;
    tenantId?: string; // Optional linking logic to be handled in service
}
