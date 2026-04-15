import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {} //  nest uses Reflector to read metadata and compare it

    // return true if user has required role
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(), // route method
            context.getClass(), // controller class
        ]);
        
        // if route does not require a role approve everybody 
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        //
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // validate if user has role
        if (!user || !user.role) {
            return false;
        }
        // return true if includes false if not
        return requiredRoles.includes(user.role);
    }
}