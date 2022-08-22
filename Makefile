#!/usr/bin/make -f

build-website:
	npm ci
	npm run build

build-ida-website: fs-activate-ida-files build-website

fs-activate-ida-files: fs-check-clean-git
	echo "\nActivate IDA files\n"
	cp -rf ida-customizations/ ./

fs-restore-main-files:
	echo "\nRestore main files, moving updates into ida-customizations\n"
	git ls-files -m | xargs -I {} sh -c 'mkdir -p ./ida-customizations/$$(dirname {}) && cp -fp {} ./ida-customizations/{}'
	git stash push -m "ida-customizations stash" -- ':!./ida-customizations/*'
	git status

fs-check-clean-git:
	if [ -z $$(git ls-files -m) ]; then : ; else echo "Work directory is not clean - please commit or stash before switching files"; exit 1; fi


# deploy-website is currently unused, deployment happens via github actions
deploy-website: build-website
	cd .vuepress/dist && \
	echo "role_arn = ${DEPLOYMENT_ROLE_ARN}" >> /root/.aws/config ; \
	echo "CI job = ${CIRCLE_BUILD_URL}" >> version.html ; \
	aws s3 sync . s3://"${WEBSITE_BUCKET}" --profile terraform --delete ; \
	aws cloudfront create-invalidation --distribution-id "${CF_DISTRIBUTION_ID}" --profile terraform --path "/*" ;

.PHONY: build-website deploy-website