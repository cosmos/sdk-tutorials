#!/usr/bin/make -f

build-website:
	npm ci
	npm run build

build-ida-website: 
	prepare-ida-files
	build-website

prepare-ida-files:
	echo "Use ida customisations"
	cp -rf ida-customisations/ ./

restore-main-files:
	echo "Restore main files, moving updates into ida-customisations"
	git ls-files -m | xargs -I {} sh -c 'mkdir -p ./ida-customisations/$(dirname {}) && cp -p {} ./ida-customisations/{}'
	git stash push -m "ida-customisations stash"
	echo `git status`

# deploy-website is currently unused, deployment happens via github actions
deploy-website: build-website
	cd .vuepress/dist && \
	echo "role_arn = ${DEPLOYMENT_ROLE_ARN}" >> /root/.aws/config ; \
	echo "CI job = ${CIRCLE_BUILD_URL}" >> version.html ; \
	aws s3 sync . s3://"${WEBSITE_BUCKET}" --profile terraform --delete ; \
	aws cloudfront create-invalidation --distribution-id "${CF_DISTRIBUTION_ID}" --profile terraform --path "/*" ;

.PHONY: build-website deploy-website