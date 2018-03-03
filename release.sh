#!/bin/bash

CURRENT_VERSION=$(cat package.json | grep version| cut -d '"' -f 4)
TO_UPDATE=("package.json" "package-lock.json")

echo -n "Current version is $CURRENT_VERSION, select new version: "
read NEW_VERSION
echo "Creating version $NEW_VERSION ...\n"

for file in "${TO_UPDATE[@]}"
do
    echo "Patching $file ..."
    sed -i "s/\"$CURRENT_VERSION\"/\"$NEW_VERSION\"/g" $file
    git add $file
done

git commit -m "$NEW_VERSION"
git push

git tag $NEW_VERSION
git push --tags

echo "Pushed source, building TS for npm"
grunt

npm publish

echo
echo "All done, $NEW_VERSION released!"
