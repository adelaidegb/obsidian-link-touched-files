## Link Touched Files Obsidian Plugin

### Design Philosophy
I want to more easily and automatically link together the files that I edit.
I am setting out with the goal to create a plugin that maintains a list of touched files in a file that the configuring user specifies.
The list will be comprised of wiki-style links (`[[Absolute/Path/to/Filename|Filename]]`) to the touched file, using the file's absolute path and name.
By considering the full absolute path, meaningful collisons will never occur.

The primary intent in supporting a configurable file to insert into is to support periodic notes—daily, weekly, etc.
In supporting configurable files, we need a file pattern, supporting some parameterization for datetime elements.
We also need a way to scope down what part of the file is editable by this plugin; a frontmatter field works well.

Upon any update that is relevant to the plugin, within the resolved file, the frontmatter field associated with this plugin is subject to be changed in any way.
All other data within the vault must be unaffected by this plugin.

This plugin will prioritize avoiding being responsible for creating a file when the resolved file is missing.

The plugin must necessarily watch for file changes. The implementation should be as lightweight as possible.

Some other file tracking, changelog-like plugins conflict with file synchronization.
One notable source of this is storing a dynamic configuration file that tracks changes; this commonly encounters conflicts when using a VCS like Git.
At any given time, this plugin will use the currently resolved file as the single source of truth for what files have been touched.

File creation and modification are relevant to this plugin.
When one of these actions occur to a file, the file will be resolved, and the frontmatter field will be updated to include the change.

File renaming is not relevant. A renamed file will already be updated in links within the Obsidian vault.

File deletion is not relevant. A deleted file will result in leaving behind broken links in any places it was formerly linked.
This is consistent with Obsidian's default behavior and I have no intent to change it.

This plugin will be opinionated first, and work to consider feature requests for configurability if and when they are received.