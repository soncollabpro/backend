import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    isEntryValid: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    creators: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::creator.creator'
    >;
    acctype: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'api::acctype.acctype'
    >;
    organisation: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::organisation.organisation'
    >;
    isMyFirst: Attribute.Boolean & Attribute.DefaultTo<false>;
    subscription: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::subscription.subscription'
    >;
    customer: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::customer.customer'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAcctypeAcctype extends Schema.CollectionType {
  collectionName: 'acctypes';
  info: {
    singularName: 'acctype';
    pluralName: 'acctypes';
    displayName: 'Acctype';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    libelle: Attribute.Enumeration<['Creator', 'Organisation']>;
    users: Attribute.Relation<
      'api::acctype.acctype',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    description: Attribute.Text;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::acctype.acctype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::acctype.acctype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAddonAddon extends Schema.CollectionType {
  collectionName: 'addons';
  info: {
    singularName: 'addon';
    pluralName: 'addons';
    displayName: 'Addon';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    libelle: Attribute.Enumeration<
      ['Biographie', 'Music Link', 'Pre-save', 'Exclusivity link']
    >;
    description: Attribute.Text;
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    type: Attribute.Enumeration<['unique', 'multiple']>;
    learnLink: Attribute.String;
    subscriptions: Attribute.Relation<
      'api::addon.addon',
      'manyToMany',
      'api::subscription.subscription'
    >;
    plans: Attribute.Relation<
      'api::addon.addon',
      'manyToMany',
      'api::plan.plan'
    >;
    hasActivated: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::addon.addon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::addon.addon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBiographieBiographie extends Schema.CollectionType {
  collectionName: 'biographies';
  info: {
    singularName: 'biographie';
    pluralName: 'biographies';
    displayName: 'Biographie';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    creator: Attribute.Relation<
      'api::biographie.biographie',
      'oneToOne',
      'api::creator.creator'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::biographie.biographie',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::biographie.biographie',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCampagnePushNotificationCampagnePushNotification
  extends Schema.CollectionType {
  collectionName: 'campagne_push_notifications';
  info: {
    singularName: 'campagne-push-notification';
    pluralName: 'campagne-push-notifications';
    displayName: 'Campagne Push Notification';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    typePush: Attribute.Enumeration<['forBoostLink', 'forCustomType']>;
    link: Attribute.String;
    buttonChoice: Attribute.Enumeration<
      [
        'ecoutez maintenant',
        'decouvrez plus',
        'voir la video',
        'voir la chanson',
        'voir le podcast'
      ]
    >;
    customTitle: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    customDescription: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    customImage: Attribute.Media<'images'>;
    customLink: Attribute.String;
    customButtons: Attribute.JSON;
    sendDateTime: Attribute.DateTime;
    campaignDuration: Attribute.Enumeration<
      ['unjour', 'troisjours', 'unesemaine', 'deuxsemaines', 'unmois']
    >;
    sendFrequency: Attribute.Enumeration<
      [
        'unefoisparjour',
        'troisfoisparsemaine',
        'unefoisparsemaine',
        'unefoisparmois'
      ]
    >;
    timezone: Attribute.String;
    campagneservice: Attribute.Relation<
      'api::campagne-push-notification.campagne-push-notification',
      'manyToOne',
      'api::campagne-service.campagne-service'
    >;
    creator: Attribute.Relation<
      'api::campagne-push-notification.campagne-push-notification',
      'manyToOne',
      'api::creator.creator'
    >;
    status: Attribute.Enumeration<
      ['active', 'pending', 'finished', 'canceled', 'suspended', 'paused']
    >;
    musiclinks: Attribute.Relation<
      'api::campagne-push-notification.campagne-push-notification',
      'manyToMany',
      'api::music-link.music-link'
    >;
    typeLink: Attribute.String;
    name: Attribute.String;
    hasDelete: Attribute.Boolean & Attribute.DefaultTo<false>;
    typecampaign: Attribute.Relation<
      'api::campagne-push-notification.campagne-push-notification',
      'oneToOne',
      'api::type-campaign.type-campaign'
    >;
    statisticsendcpns: Attribute.Relation<
      'api::campagne-push-notification.campagne-push-notification',
      'oneToMany',
      'api::statistic-send-cpn.statistic-send-cpn'
    >;
    statisticclickcpns: Attribute.Relation<
      'api::campagne-push-notification.campagne-push-notification',
      'oneToMany',
      'api::statistic-click-cpn.statistic-click-cpn'
    >;
    lastSentDate: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::campagne-push-notification.campagne-push-notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::campagne-push-notification.campagne-push-notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCampagneServiceCampagneService
  extends Schema.CollectionType {
  collectionName: 'campagne_services';
  info: {
    singularName: 'campagne-service';
    pluralName: 'campagne-services';
    displayName: 'Campagne Service';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    description: Attribute.Text;
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    libelle: Attribute.Enumeration<['push notification']>;
    hasActivated: Attribute.Boolean & Attribute.DefaultTo<true>;
    campagnepushnotifications: Attribute.Relation<
      'api::campagne-service.campagne-service',
      'oneToMany',
      'api::campagne-push-notification.campagne-push-notification'
    > &
      Attribute.Private;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::campagne-service.campagne-service',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::campagne-service.campagne-service',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiContactContact extends Schema.CollectionType {
  collectionName: 'contacts';
  info: {
    singularName: 'contact';
    pluralName: 'contacts';
    displayName: 'Contact';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    nom: Attribute.String & Attribute.Required;
    prenom: Attribute.String & Attribute.Required;
    email: Attribute.Email;
    telephone: Attribute.String;
    anniversaire: Attribute.Date;
    sexe: Attribute.Enumeration<['Homme', 'Femme']>;
    myfanbase: Attribute.Relation<
      'api::contact.contact',
      'manyToOne',
      'api::my-fanbase.my-fanbase'
    >;
    hasDelete: Attribute.Boolean & Attribute.DefaultTo<false>;
    country: Attribute.String & Attribute.Required;
    age: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 130;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::contact.contact',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::contact.contact',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCreatorCreator extends Schema.CollectionType {
  collectionName: 'creators';
  info: {
    singularName: 'creator';
    pluralName: 'creators';
    displayName: 'Creator';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    user: Attribute.Relation<
      'api::creator.creator',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    type: Attribute.Enumeration<['spotify', 'youtube']>;
    linkedAccount: Attribute.String;
    hasNowActivated: Attribute.Boolean & Attribute.DefaultTo<false>;
    biographie: Attribute.Relation<
      'api::creator.creator',
      'oneToOne',
      'api::biographie.biographie'
    >;
    currency: Attribute.Relation<
      'api::creator.creator',
      'manyToOne',
      'api::currency.currency'
    >;
    creatorName: Attribute.String;
    musiclinks: Attribute.Relation<
      'api::creator.creator',
      'oneToMany',
      'api::music-link.music-link'
    >;
    myconnects: Attribute.Relation<
      'api::creator.creator',
      'oneToMany',
      'api::my-connect.my-connect'
    >;
    myfanbase: Attribute.Relation<
      'api::creator.creator',
      'oneToOne',
      'api::my-fanbase.my-fanbase'
    >;
    campagnepushnotifications: Attribute.Relation<
      'api::creator.creator',
      'oneToMany',
      'api::campagne-push-notification.campagne-push-notification'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::creator.creator',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::creator.creator',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCurrencyCurrency extends Schema.CollectionType {
  collectionName: 'currencies';
  info: {
    singularName: 'currency';
    pluralName: 'currencies';
    displayName: 'Currency';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    symbole: Attribute.String;
    cost: Attribute.Decimal;
    creators: Attribute.Relation<
      'api::currency.currency',
      'oneToMany',
      'api::creator.creator'
    >;
    libelle: Attribute.String;
    sign: Attribute.String;
    strCurrency: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::currency.currency',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::currency.currency',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCustomerCustomer extends Schema.CollectionType {
  collectionName: 'customers';
  info: {
    singularName: 'customer';
    pluralName: 'customers';
    displayName: 'Customer';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    user: Attribute.Relation<
      'api::customer.customer',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    customerId: Attribute.String & Attribute.Private;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::customer.customer',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::customer.customer',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFcmtkFcmtk extends Schema.CollectionType {
  collectionName: 'fcmtks';
  info: {
    singularName: 'fcmtk';
    pluralName: 'fcmtks';
    displayName: 'fcmtk';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    token: Attribute.Text;
    myfanbase: Attribute.Relation<
      'api::fcmtk.fcmtk',
      'manyToOne',
      'api::my-fanbase.my-fanbase'
    >;
    musiclink: Attribute.Relation<
      'api::fcmtk.fcmtk',
      'manyToOne',
      'api::music-link.music-link'
    >;
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    subscription: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::fcmtk.fcmtk',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::fcmtk.fcmtk',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFunctionalityFunctionality extends Schema.CollectionType {
  collectionName: 'functionalities';
  info: {
    singularName: 'functionality';
    pluralName: 'functionalities';
    displayName: 'Functionality';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    libelle: Attribute.String;
    subtitle: Attribute.Text;
    description: Attribute.Text;
    plans: Attribute.Relation<
      'api::functionality.functionality',
      'manyToMany',
      'api::plan.plan'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::functionality.functionality',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::functionality.functionality',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMusicLinkMusicLink extends Schema.CollectionType {
  collectionName: 'music_links';
  info: {
    singularName: 'music-link';
    pluralName: 'music-links';
    displayName: 'Music Link';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    title: Attribute.String;
    hasSecondLine: Attribute.Boolean & Attribute.DefaultTo<false>;
    secondLine: Attribute.String;
    btnMl: Attribute.JSON;
    socialsMl: Attribute.JSON;
    hasLogoPowered: Attribute.Boolean & Attribute.DefaultTo<true>;
    hasSocialPlatform: Attribute.Boolean & Attribute.DefaultTo<false>;
    theme: Attribute.Enumeration<['classic', 'full-image']>;
    linkDisplay: Attribute.Enumeration<['card', 'stacked']>;
    titlePrimaryFont: Attribute.Enumeration<
      ['Montserrat', 'Inter', 'Poppins', 'PT Sans', 'Soncollab']
    >;
    pageColor: Attribute.String;
    pageColorCodeText: Attribute.String;
    buttonColor: Attribute.String;
    buttonColorCodeText: Attribute.String;
    backgroundType: Attribute.Enumeration<['cover-image', 'cover-color']>;
    backgroundTypeColor: Attribute.String;
    backgroundTypeColorCodeText: Attribute.String;
    tiktokPixel: Attribute.String;
    googlePixel: Attribute.String;
    smartLink: Attribute.String;
    creator: Attribute.Relation<
      'api::music-link.music-link',
      'manyToOne',
      'api::creator.creator'
    >;
    name: Attribute.String;
    idLinkSpotify: Attribute.String;
    typeLinkspotify: Attribute.Enumeration<['single', 'album']>;
    url: Attribute.String;
    orderBtnMl: Attribute.JSON;
    orderSocialsMl: Attribute.JSON;
    musicData: Attribute.JSON;
    uniqueKey: Attribute.String;
    statisticvisitors: Attribute.Relation<
      'api::music-link.music-link',
      'oneToMany',
      'api::statistic-visitor.statistic-visitor'
    >;
    statisticclicks: Attribute.Relation<
      'api::music-link.music-link',
      'oneToMany',
      'api::statistic-click.statistic-click'
    >;
    xPixel: Attribute.String;
    hasBoostNotif: Attribute.Boolean & Attribute.DefaultTo<false>;
    fcmtks: Attribute.Relation<
      'api::music-link.music-link',
      'oneToMany',
      'api::fcmtk.fcmtk'
    >;
    hasDelete: Attribute.Boolean & Attribute.DefaultTo<false>;
    campagnepushnotifications: Attribute.Relation<
      'api::music-link.music-link',
      'manyToMany',
      'api::campagne-push-notification.campagne-push-notification'
    >;
    typelink: Attribute.Relation<
      'api::music-link.music-link',
      'oneToOne',
      'api::type-link.type-link'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::music-link.music-link',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::music-link.music-link',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMusicLinkPlatformMusicLinkPlatform
  extends Schema.CollectionType {
  collectionName: 'music_link_platforms';
  info: {
    singularName: 'music-link-platform';
    pluralName: 'music-link-platforms';
    displayName: 'Music Link Platform';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    imageLogo: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    formatLinkSingle: Attribute.String;
    libelle: Attribute.Enumeration<
      [
        'spotify',
        'youtube music',
        'apple music',
        'deezer',
        'amazon music',
        'tidal',
        'audiomack',
        'anghami',
        'soundcloud',
        'boomplay',
        'bandcamp',
        'fnac',
        'autre'
      ]
    >;
    hasActivated: Attribute.Boolean & Attribute.DefaultTo<false>;
    formatLinkAlbum: Attribute.String;
    hasDefault: Attribute.Boolean & Attribute.DefaultTo<false>;
    formatLinkAnother: Attribute.String;
    imageBtnLight: Attribute.Media<'images'>;
    imageBtnDark: Attribute.Media<'images'>;
    statisticclicks: Attribute.Relation<
      'api::music-link-platform.music-link-platform',
      'oneToMany',
      'api::statistic-click.statistic-click'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::music-link-platform.music-link-platform',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::music-link-platform.music-link-platform',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMusicLinkSocialMusicLinkSocial
  extends Schema.CollectionType {
  collectionName: 'music_link_socials';
  info: {
    singularName: 'music-link-social';
    pluralName: 'music-link-socials';
    displayName: 'Music Link Social';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    libelle: Attribute.Enumeration<
      ['facebook', 'instagram', 'tiktok', 'x', 'youtube']
    >;
    hasActivated: Attribute.Boolean & Attribute.DefaultTo<false>;
    imgLogo: Attribute.Media<'images'>;
    hasDefault: Attribute.Boolean & Attribute.DefaultTo<false>;
    imageSoLight: Attribute.Media<'images'>;
    imageSoDark: Attribute.Media<'images'>;
    formatLink: Attribute.String;
    statisticclicks: Attribute.Relation<
      'api::music-link-social.music-link-social',
      'oneToMany',
      'api::statistic-click.statistic-click'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::music-link-social.music-link-social',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::music-link-social.music-link-social',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMyConnectMyConnect extends Schema.CollectionType {
  collectionName: 'my_connects';
  info: {
    singularName: 'my-connect';
    pluralName: 'my-connects';
    displayName: 'My connect';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    platforms: Attribute.Enumeration<['spotify', 'youtube']>;
    creator: Attribute.Relation<
      'api::my-connect.my-connect',
      'manyToOne',
      'api::creator.creator'
    >;
    statisticfolowersconnects: Attribute.Relation<
      'api::my-connect.my-connect',
      'oneToMany',
      'api::statistic-folowers-connect.statistic-folowers-connect'
    >;
    url: Attribute.String;
    platformsconnect: Attribute.Relation<
      'api::my-connect.my-connect',
      'manyToOne',
      'api::platforms-connect.platforms-connect'
    >;
    default: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::my-connect.my-connect',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::my-connect.my-connect',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMyFanbaseMyFanbase extends Schema.CollectionType {
  collectionName: 'my_fanbases';
  info: {
    singularName: 'my-fanbase';
    pluralName: 'my-fanbases';
    displayName: 'My fanbase';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    creator: Attribute.Relation<
      'api::my-fanbase.my-fanbase',
      'oneToOne',
      'api::creator.creator'
    >;
    fcmtks: Attribute.Relation<
      'api::my-fanbase.my-fanbase',
      'oneToMany',
      'api::fcmtk.fcmtk'
    >;
    contacts: Attribute.Relation<
      'api::my-fanbase.my-fanbase',
      'oneToMany',
      'api::contact.contact'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::my-fanbase.my-fanbase',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::my-fanbase.my-fanbase',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganisationOrganisation extends Schema.CollectionType {
  collectionName: 'organisations';
  info: {
    singularName: 'organisation';
    pluralName: 'organisations';
    displayName: 'Organisation';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    user: Attribute.Relation<
      'api::organisation.organisation',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organisation.organisation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::organisation.organisation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPlanPlan extends Schema.CollectionType {
  collectionName: 'plans';
  info: {
    singularName: 'plan';
    pluralName: 'plans';
    displayName: 'Plan';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    subscriptions: Attribute.Relation<
      'api::plan.plan',
      'oneToMany',
      'api::subscription.subscription'
    >;
    libelle: Attribute.String;
    description: Attribute.Text;
    priceMonth: Attribute.Decimal;
    priceYear: Attribute.Decimal;
    strIdMonth: Attribute.String;
    strIdYear: Attribute.String;
    trialchecks: Attribute.Relation<
      'api::plan.plan',
      'manyToMany',
      'api::trialcheck.trialcheck'
    >;
    productId: Attribute.String;
    level: Attribute.Integer;
    type: Attribute.Enumeration<['free', 'pro']>;
    functionalities: Attribute.Relation<
      'api::plan.plan',
      'manyToMany',
      'api::functionality.functionality'
    >;
    addons: Attribute.Relation<
      'api::plan.plan',
      'manyToMany',
      'api::addon.addon'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::plan.plan', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::plan.plan', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiPlatformsConnectPlatformsConnect
  extends Schema.CollectionType {
  collectionName: 'platforms_connects';
  info: {
    singularName: 'platforms-connect';
    pluralName: 'platforms-connects';
    displayName: 'Platforms connect';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    libelle: Attribute.Enumeration<['spotify', 'youtube']>;
    hasActivated: Attribute.Boolean & Attribute.DefaultTo<false>;
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    myconnects: Attribute.Relation<
      'api::platforms-connect.platforms-connect',
      'oneToMany',
      'api::my-connect.my-connect'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::platforms-connect.platforms-connect',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::platforms-connect.platforms-connect',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStatisticClickStatisticClick extends Schema.CollectionType {
  collectionName: 'statistic_clicks';
  info: {
    singularName: 'statistic-click';
    pluralName: 'statistic-clicks';
    displayName: 'Statistic Click';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    from: Attribute.String;
    musiclinkplatform: Attribute.Relation<
      'api::statistic-click.statistic-click',
      'manyToOne',
      'api::music-link-platform.music-link-platform'
    >;
    ip: Attribute.String;
    days: Attribute.DateTime;
    city: Attribute.String;
    country: Attribute.String;
    musiclink: Attribute.Relation<
      'api::statistic-click.statistic-click',
      'manyToOne',
      'api::music-link.music-link'
    >;
    type: Attribute.Enumeration<['social', 'platform']>;
    continent: Attribute.String;
    countryCode: Attribute.String;
    regionName: Attribute.String;
    uniqueKey: Attribute.String;
    musiclinksocial: Attribute.Relation<
      'api::statistic-click.statistic-click',
      'manyToOne',
      'api::music-link-social.music-link-social'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::statistic-click.statistic-click',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::statistic-click.statistic-click',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStatisticClickCpnStatisticClickCpn
  extends Schema.CollectionType {
  collectionName: 'statistic_click_cpns';
  info: {
    singularName: 'statistic-click-cpn';
    pluralName: 'statistic-click-cpns';
    displayName: 'Statistic Click CPN';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    campagnepushnotification: Attribute.Relation<
      'api::statistic-click-cpn.statistic-click-cpn',
      'manyToOne',
      'api::campagne-push-notification.campagne-push-notification'
    >;
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    count: Attribute.Integer;
    clickTime: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::statistic-click-cpn.statistic-click-cpn',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::statistic-click-cpn.statistic-click-cpn',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStatisticFolowersConnectStatisticFolowersConnect
  extends Schema.CollectionType {
  collectionName: 'statistic_folowers_connects';
  info: {
    singularName: 'statistic-folowers-connect';
    pluralName: 'statistic-folowers-connects';
    displayName: 'Statistic Folowers Connect';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    currentFollowers: Attribute.Integer;
    myconnect: Attribute.Relation<
      'api::statistic-folowers-connect.statistic-folowers-connect',
      'manyToOne',
      'api::my-connect.my-connect'
    >;
    lastUpdate: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::statistic-folowers-connect.statistic-folowers-connect',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::statistic-folowers-connect.statistic-folowers-connect',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStatisticSendCpnStatisticSendCpn
  extends Schema.CollectionType {
  collectionName: 'statistic_send_cpns';
  info: {
    singularName: 'statistic-send-cpn';
    pluralName: 'statistic-send-cpns';
    displayName: 'Statistic Send CPN';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    campagnepushnotification: Attribute.Relation<
      'api::statistic-send-cpn.statistic-send-cpn',
      'manyToOne',
      'api::campagne-push-notification.campagne-push-notification'
    >;
    sendDateTime: Attribute.DateTime;
    count: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::statistic-send-cpn.statistic-send-cpn',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::statistic-send-cpn.statistic-send-cpn',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStatisticVisitorStatisticVisitor
  extends Schema.CollectionType {
  collectionName: 'statistic_visitors';
  info: {
    singularName: 'statistic-visitor';
    pluralName: 'statistic-visitors';
    displayName: 'Statistic Visitor';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    ip: Attribute.String;
    days: Attribute.DateTime;
    city: Attribute.String;
    country: Attribute.String;
    musiclink: Attribute.Relation<
      'api::statistic-visitor.statistic-visitor',
      'manyToOne',
      'api::music-link.music-link'
    >;
    screenResolution: Attribute.String;
    countryCode: Attribute.String;
    regionName: Attribute.String;
    continent: Attribute.String;
    count: Attribute.Integer & Attribute.DefaultTo<1>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::statistic-visitor.statistic-visitor',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::statistic-visitor.statistic-visitor',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSubscriptionSubscription extends Schema.CollectionType {
  collectionName: 'subscriptions';
  info: {
    singularName: 'subscription';
    pluralName: 'subscriptions';
    displayName: 'Subscription';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    user: Attribute.Relation<
      'api::subscription.subscription',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    trialcheck: Attribute.Relation<
      'api::subscription.subscription',
      'oneToOne',
      'api::trialcheck.trialcheck'
    >;
    addons: Attribute.Relation<
      'api::subscription.subscription',
      'manyToMany',
      'api::addon.addon'
    >;
    startDate: Attribute.DateTime;
    endDate: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['init', 'active', 'free', 'expired', 'canceled', 'trialing']
    > &
      Attribute.DefaultTo<'init'>;
    startTrial: Attribute.DateTime;
    endTrial: Attribute.DateTime;
    hasTrial: Attribute.Boolean & Attribute.DefaultTo<false>;
    timeplan: Attribute.Enumeration<['month', 'year']>;
    plan: Attribute.Relation<
      'api::subscription.subscription',
      'manyToOne',
      'api::plan.plan'
    >;
    subId: Attribute.String;
    alreadyTried: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::subscription.subscription',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::subscription.subscription',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTrialcheckTrialcheck extends Schema.CollectionType {
  collectionName: 'trialchecks';
  info: {
    singularName: 'trialcheck';
    pluralName: 'trialchecks';
    displayName: 'Trialcheck';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    subscription: Attribute.Relation<
      'api::trialcheck.trialcheck',
      'oneToOne',
      'api::subscription.subscription'
    >;
    plans: Attribute.Relation<
      'api::trialcheck.trialcheck',
      'manyToMany',
      'api::plan.plan'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::trialcheck.trialcheck',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::trialcheck.trialcheck',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTypeCampaignTypeCampaign extends Schema.CollectionType {
  collectionName: 'type_campaigns';
  info: {
    singularName: 'type-campaign';
    pluralName: 'type-campaigns';
    displayName: 'Type Campaign';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    key: Attribute.Enumeration<['push-notification']>;
    campagnepushnotification: Attribute.Relation<
      'api::type-campaign.type-campaign',
      'oneToOne',
      'api::campagne-push-notification.campagne-push-notification'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::type-campaign.type-campaign',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::type-campaign.type-campaign',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTypeLinkTypeLink extends Schema.CollectionType {
  collectionName: 'type_links';
  info: {
    singularName: 'type-link';
    pluralName: 'type-links';
    displayName: 'Type link';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    key: Attribute.Enumeration<['musiclink']>;
    musiclink: Attribute.Relation<
      'api::type-link.type-link',
      'oneToOne',
      'api::music-link.music-link'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::type-link.type-link',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::type-link.type-link',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiWebsiteWebsite extends Schema.SingleType {
  collectionName: 'websites';
  info: {
    singularName: 'website';
    pluralName: 'websites';
    displayName: 'Website';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    uuid: Attribute.UID & Attribute.CustomField<'plugin::field-nanoid.nanoid'>;
    heroTitle: Attribute.Text;
    heroDescription: Attribute.Text;
    heroImage: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    soncollabLight: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    soncollabDark: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    associateImage: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    creatorAccountLimit: Attribute.Integer;
    subscribeImg1: Attribute.Media<'images' | 'videos'>;
    trialDay: Attribute.Integer;
    subscribeLibelle: Attribute.Text;
    subscribeDescription: Attribute.Text;
    subscribeLibelleNoTrial: Attribute.Text;
    subscribeDescriptionNoTrial: Attribute.Text;
    createMusicLinkLimit: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::website.website',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::website.website',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'plugin::i18n.locale': PluginI18NLocale;
      'api::acctype.acctype': ApiAcctypeAcctype;
      'api::addon.addon': ApiAddonAddon;
      'api::biographie.biographie': ApiBiographieBiographie;
      'api::campagne-push-notification.campagne-push-notification': ApiCampagnePushNotificationCampagnePushNotification;
      'api::campagne-service.campagne-service': ApiCampagneServiceCampagneService;
      'api::contact.contact': ApiContactContact;
      'api::creator.creator': ApiCreatorCreator;
      'api::currency.currency': ApiCurrencyCurrency;
      'api::customer.customer': ApiCustomerCustomer;
      'api::fcmtk.fcmtk': ApiFcmtkFcmtk;
      'api::functionality.functionality': ApiFunctionalityFunctionality;
      'api::music-link.music-link': ApiMusicLinkMusicLink;
      'api::music-link-platform.music-link-platform': ApiMusicLinkPlatformMusicLinkPlatform;
      'api::music-link-social.music-link-social': ApiMusicLinkSocialMusicLinkSocial;
      'api::my-connect.my-connect': ApiMyConnectMyConnect;
      'api::my-fanbase.my-fanbase': ApiMyFanbaseMyFanbase;
      'api::organisation.organisation': ApiOrganisationOrganisation;
      'api::plan.plan': ApiPlanPlan;
      'api::platforms-connect.platforms-connect': ApiPlatformsConnectPlatformsConnect;
      'api::statistic-click.statistic-click': ApiStatisticClickStatisticClick;
      'api::statistic-click-cpn.statistic-click-cpn': ApiStatisticClickCpnStatisticClickCpn;
      'api::statistic-folowers-connect.statistic-folowers-connect': ApiStatisticFolowersConnectStatisticFolowersConnect;
      'api::statistic-send-cpn.statistic-send-cpn': ApiStatisticSendCpnStatisticSendCpn;
      'api::statistic-visitor.statistic-visitor': ApiStatisticVisitorStatisticVisitor;
      'api::subscription.subscription': ApiSubscriptionSubscription;
      'api::trialcheck.trialcheck': ApiTrialcheckTrialcheck;
      'api::type-campaign.type-campaign': ApiTypeCampaignTypeCampaign;
      'api::type-link.type-link': ApiTypeLinkTypeLink;
      'api::website.website': ApiWebsiteWebsite;
    }
  }
}
