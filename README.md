# Act-Tag-Release

Want help creating releases?
We got you covered.

a simple to implement workflow to add a release easily to your project.

## Usage

```yaml
# release.yml
jobs:
    release:
        runs-on: ubuntu-latest
        name: Create Release
        steps:
            - name: Checkout
                uses: actions/checkout@v2
            - name: Release Action
                uses: ./
                id: release-action # Could be anything
                env:
                    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The environment variable `GITHUB_TOKEN` is required to create a release.
without it, the action will fail.


## Configuration

For the tags.yml file or if needed you can change the name by specifying the `config-file` parameter.

```yaml
# tags.yml
name: <required> # name of the release
description: <optional> # description of the release
description-file: <optional> # path to the description file
```

## Contributing

Any contributions are welcome. Feel free to open an issue or create a pull request.