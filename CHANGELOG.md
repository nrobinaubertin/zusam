# Changelog

To upgrade, follow the [upgrade guide](https://github.com/zusam/zusam/blob/master/documentation/update.md).

## [0.4.3] - 2021-01-17

### Log
- Fix lichess embeds
- Avoid multiple calls to the endpoint for the same search
- Fix public link not taking subpath into account
- Use user submitted createdAt on message creation
- Change display of video being converted
- Change icon for the backButton
- Display notification title on hover
- Remove hover effect on avatars
- Increase XL layout threshold
- Fix bookmark board when some messages are missing
- Rework options of PreparePreviews command
- Update API dependencies (fix youtube embeds)

### Remarks
Minor fix release.  
You can fix the existing youtube embeds (if some are missing) with the PreparePreviews command.  
```
php bin/console zusam:prepare-previews --force --filter=youtube.com
php bin/console zusam:prepare-previews --force --filter=youtu.be
```

## [0.4.2] - 2020-09-06

### Log
- Add auto-generated API documentation at /api/doc
- The webapp now correctly handles api upload capabilities
- Enable reset of the user's own API key
- Use the Symfony UUID polyfill
- Embed arte.tv
- Add a new feature: bookmarks
- Rework file upload inner working to make them more reliable
- Enhance notifications display
- Various fixes

### Remarks
Minor feature release.  
This release fixes support for emails login with a '+' in them. If you have user like that, they will not be able to log in anymore.  
You can fix this by running the following on the database:
```
UPDATE user SET login = replace(login, ' ', '+');
```

## [0.4.1] - 2020-04-21

### Log
- Rework the cache by offloading it to service workers.
- Add ALLOW_* parameters to the API to only allow certain types of uploads
- Embed lichess.org
- Decorelate cache and long term storage
- Use bootstrap as the base for the scss (again)
- Add purgeCSS to remove unused compiled css
- Display group names in messages
- Rework message component (code simplifications)
- Remove href for images while in edit mode (clicking on it would quit editing)
- Various tiny fixes

### Remarks
Mostly bugfix release.

## [0.4] - 2020-02-16

### Log
- Rework backend to remove dependency to api-platform
- Rework container to be compatible with podman
- Start writing tests and prepare test environment
- Store log outside of the database in a plain file
- Upgrade to Preact 10
- Upgrade to Symfony 5
- Split out some modules from the webapp
- Add notifications feature
- Add reply to comments feature
- Add search feature
- Fix loadEnv issues on the backend
- Add IDLE_HOURS parameter for the backend
- Fix Uuid service from producing invalid UUIDs
- Allow Zusam to be on a subpath of the domain
- Fix notification emails
- Add CSP headers to the container
- Rework the container to be "podman compatible"
- Create identicons for users without an avatar
- Use prettier on the webapp

### Remarks
Feature release.  
This update has a database structure change. Please see the corresponding migration file.  

## [0.3.2] - 2019-08-24

### Log
- Add installation guide for debian buster with apache
- Add some necessary directories to git: data/cache and data/files
- Fix dev scripts when used in a git worktree directory
- Take timing from twitch url into account in embeds
- Use fixed height images in the lightbox (nlg.js)

### Remarks
Bugfix release.

## [0.3.1] - 2019-08-01

### Log
- Add documentation for debian buster
- Add user list in group-settings
- Allow long format images
- Display share button only if the user has more than 1 group
- Fix avatar change and upscale its resolution
- Fix english translation
- Fix new messages not appearing immediately
- Fix signup during invitation
- Fix title input changing form when inputting a space
- Remove demo instance files
- Update dependencies and dockerfile packages

### Remarks
Mostly bugfix release.

## [0.3] - 2019-07-24

### Log
- Update to symfony 4.3
- Switch security password encoder to 'auto'
- Regenerate message preview on edition
- Add "default group" option
- Add Log and System entities
- Add CleanLogs, CleanGroups, CleanMessages, RepairDatabase commands
- Add message sharing feature
- Rework Cron: will now be called on kernel.terminate event
- Redirect nginx output to stdout
- Return only JSON from the API
- Avoid displaying empty messages
- Simplify commands invocations
- .env is now the default config and .env.local symlinks to data/config

### Remarks
Feature release.  
This update has a database structure change. Please see the corresponding migration file.  

Cron tasks will now execute after each API call. This means that if your Zusam instance is visited sufficiently often, you don't need to call it from the system cron anymore.  
The first time RepairDatabase will be executed, it could take some time (and cause some API calls to timeout). To avoid this, you can execute it yourself during the upgrade (after having applied the SQL migration) with `php api/bin/console zusam:repair-database`.

:warning: The configuration change (.env => .env.local) could impact you if you customized your configuration file paths. Make sure to update the symlink if necessary.  
These changes were made to be compliant with the symfony specifications:
- https://symfony.com/doc/current/best_practices/configuration.html
- https://symfony.com/doc/current/configuration/dot-env-changes.html

## [0.2] - 2019-05-06

### Log
- Add slovak translation
- Add opt-in notification emails
- Fix video loading in albums
- Add public link feature
- Rework news styling
- Fix gif upload
- Declare the webapp as a PWA with a share-intent

### Remarks
Feature release.  
:warning: Support for PHP 7.1 was dropped.  
This update has a database structure change. Please see the corresponding migration file.  

## [0.1.1] - 2019-03-29

### Log
- Fix styling issues in chrome
- Fix s6 lockups in docker
- Fix lightbox on image urls
- Add a writerId to each writer component to avoid edge cases
- Add spanish translation

### Remarks
Mostly bugfix release.

## [0.1] - 2019-03-21
This is the first release of Zusam that is meant to be used broadly.
