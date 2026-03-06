import { Prisma } from '@prisma/client';

export function softDeleteMiddleware(): Prisma.Middleware {
    return async (params, next) => {
        // Check if the model has 'deletedAt' field (We assume core models do)
        const modelsWithSoftDelete = ['Property', 'LeaseContract', 'Tenant', 'Maintenance', 'Invoice'];

        if (params.model && modelsWithSoftDelete.includes(params.model)) {
            if (params.action === 'delete') {
                // Change to update
                params.action = 'update';
                params.args['data'] = { deletedAt: new Date() };
            }
            if (params.action === 'deleteMany') {
                // Change to updateMany
                params.action = 'updateMany';
                if (params.args.data !== undefined) {
                    params.args.data['deletedAt'] = new Date();
                } else {
                    params.args.data = { deletedAt: new Date() };
                }
            }
        }
        return next(params);
    };
}

export function filterSoftDeletedMiddleware(): Prisma.Middleware {
    return async (params, next) => {
        const modelsWithSoftDelete = ['Property', 'LeaseContract', 'Tenant', 'Maintenance', 'Invoice'];

        if (params.model && modelsWithSoftDelete.includes(params.model)) {
            if (params.action === 'findUnique' || params.action === 'findFirst') {
                // Change to findFirst
                params.action = 'findFirst';
                params.args.where['deletedAt'] = null;
            }
            if (params.action === 'findMany') {
                if (params.args.where) {
                    if (params.args.where.deletedAt === undefined) {
                        params.args.where['deletedAt'] = null;
                    }
                } else {
                    params.args.where = { deletedAt: null };
                }
            }
        }
        return next(params);
    };
}
