import { ForbiddenException } from '@nestjs/common';
import { Role } from 'src/users/roles/roles.enum';

/**
 * The function validates the user's role for registration and throws exceptions if the role is already
 * registered or conflicts with existing roles.
 * @param {Role[]} existingUserRoles - An array of Role values representing the roles that the user
 * already has registered.
 * @param {Role} userRole - The `userRole` parameter represents the role that the user is trying to
 * register with. It is of type `Role`, which is an enum that defines different user roles such as
 * `Admin`, `Client`, `Coach`, and `Trainer`.
 * @returns nothing (undefined).
 */
export async function validateUserRoleForRegistration(
  existingUserRoles: Role[],
  userRole: Role,
) {
  if (existingUserRoles.includes(userRole)) {
    throw new ForbiddenException('Email already in use.');
  }

  if (userRole === Role.Admin && existingUserRoles.includes(Role.Client)) {
    throw new ForbiddenException('Clients cannot register as admins.');
  }

  if (userRole === Role.Client && existingUserRoles.includes(Role.Admin)) {
    throw new ForbiddenException('Admins cannot register as clients.');
  }

  if (
    (userRole === Role.Coach || userRole === Role.Trainer) &&
    existingUserRoles.includes(Role.Admin)
  ) {
    throw new ForbiddenException('Admins cannot register as instructors.');
  }

  if (
    (existingUserRoles.includes(Role.Trainer) ||
      existingUserRoles.includes(Role.Coach)) &&
    userRole === Role.Admin
  ) {
    throw new ForbiddenException('Instructors cannot register as admins.');
  }

  if (
    (existingUserRoles.includes(Role.Trainer) && userRole === Role.Coach) ||
    (existingUserRoles.includes(Role.Coach) && userRole === Role.Trainer)
  ) {
    throw new ForbiddenException(
      'You cannot register as a Coach because you are already registered as an Instructor.',
    );
  }

  return;
}
